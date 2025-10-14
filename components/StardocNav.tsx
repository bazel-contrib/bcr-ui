import React, { useState, useEffect } from 'react'
import { StardocModuleInfo } from '../data/stardoc'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faCog,
  faWrench,
  faBox,
  faSearch,
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'

interface StardocNavProps {
  moduleName: string
  version: string
  stardocs: StardocModuleInfo[]
}

interface NavItem {
  id: string
  label: string
  type: 'header' | 'file' | 'function' | 'rule' | 'provider' | 'aspect'
  level: number
  children?: NavItem[]
}

// Helper function to generate anchor IDs (matching Stardoc component)
const generateAnchorId = (type: string, name: string): string => {
  const cleanName = name
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .toLowerCase()

  if (type === 'file') {
    return cleanName
  }
  return `${type}-${cleanName}`
}

// Generate navigation structure from stardocs
const generateNavStructure = (stardocs: StardocModuleInfo[]): NavItem[] => {
  const navItems: NavItem[] = []

  // Add stardocs if they exist
  if (stardocs && stardocs.length > 0) {
    const fileItems = stardocs.map((stardoc) => {
      const fileAnchorId = generateAnchorId('file', stardoc.file || 'module')
      const fileItem: NavItem = {
        id: fileAnchorId,
        label: stardoc.file || 'Module',
        type: 'file',
        level: 0,
        children: [],
      }

      // Add functions
      if (stardoc.funcInfo && stardoc.funcInfo.length > 0) {
        const functions = stardoc.funcInfo.map((func) => ({
          id: generateAnchorId('function', func.functionName),
          label: func.functionName,
          type: 'function' as const,
          level: 1,
        }))
        fileItem.children!.push(...functions)
      }

      // Add rules
      if (stardoc.ruleInfo && stardoc.ruleInfo.length > 0) {
        const rules = stardoc.ruleInfo.map((rule) => ({
          id: generateAnchorId('rule', rule.ruleName),
          label: rule.ruleName,
          type: 'rule' as const,
          level: 1,
        }))
        fileItem.children!.push(...rules)
      }

      // Add providers
      if (stardoc.providerInfo && stardoc.providerInfo.length > 0) {
        const providers = stardoc.providerInfo.map((provider) => ({
          id: generateAnchorId('provider', provider.providerName),
          label: provider.providerName,
          type: 'provider' as const,
          level: 1,
        }))
        fileItem.children!.push(...providers)
      }

      // Add aspects
      if (stardoc.aspectInfo && stardoc.aspectInfo.length > 0) {
        const aspects = stardoc.aspectInfo.map((aspect) => ({
          id: generateAnchorId('aspect', aspect.aspectName),
          label: aspect.aspectName,
          type: 'aspect' as const,
          level: 1,
        }))
        fileItem.children!.push(...aspects)
      }

      return fileItem
    })

    navItems.push(...fileItems)
  }

  return navItems
}

// Get icon for different types
const getTypeIcon = (type: string, label: string) => {
  switch (type) {
    case 'header':
      return faBook
    case 'file':
      return null
    case 'function':
      return faCog
    case 'rule':
      return faWrench
    case 'provider':
      return faBox
    case 'aspect':
      return faSearch
  }
}

export const StardocNav: React.FC<StardocNavProps> = ({
  moduleName,
  version,
  stardocs,
}) => {
  const [activeSection, setActiveSection] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())
  const [isUserNavigating, setIsUserNavigating] = useState(false)

  const navStructure = generateNavStructure(stardocs)

  // Handle initial page load with hash and browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove the # symbol
      if (hash) {
        setActiveSection(hash)
        // Scroll to the section after a brief delay to ensure the page is loaded
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }, 100)
      }
    }

    // Handle initial load
    handleHashChange()

    // Handle browser back/forward navigation
    window.addEventListener('popstate', handleHashChange)

    return () => {
      window.removeEventListener('popstate', handleHashChange)
    }
  }, [])

  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      // Set flag to indicate user-initiated navigation
      setIsUserNavigating(true)
      setActiveSection(sectionId)

      element.scrollIntoView({
        behavior: 'instant',
        block: 'start',
      })
      // Update the URL hash
      window.history.pushState(null, '', `#${sectionId}`)

      // Reset flag after scroll animation completes
      setTimeout(() => {
        setIsUserNavigating(false)
      }, 1000)
    }
  }

  // Handle section expansion/collapse
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  // Handle click on navigation item
  const handleNavItemClick = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      // For items with children, toggle expansion first
      toggleSection(item.id)
      // Then scroll to the section after a brief delay to allow expansion animation
      setTimeout(() => {
        scrollToSection(item.id)
      }, 100)
    } else {
      // For leaf items, just scroll to the section
      scrollToSection(item.id)
    }
  }

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Don't update active section if user is navigating (to prevent conflicts)
      if (isUserNavigating) {
        return
      }

      const sections = navStructure.flatMap((item) => {
        const items = [item]
        if (item.children) {
          items.push(
            ...item.children.flatMap((child) => {
              const childItems = [child]
              if (child.children) {
                childItems.push(...child.children)
              }
              return childItems
            })
          )
        }
        return items
      })

      const scrollPosition = window.scrollY + 100 // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        const element = document.getElementById(section.id)
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [navStructure, isUserNavigating])

  // Render navigation item
  const renderNavItem = (item: NavItem) => {
    const isActive = activeSection === item.id
    const isExpanded = expandedSections.has(item.id)
    const hasChildren = item.children && item.children.length > 0
    const isHeader = item.type === 'header'

    return (
      <div key={item.id} className={'mb-1'}>
        <div
          className={`flex items-center py-1 pr-2 text-sm transition-colors ${
            isHeader
              ? 'cursor-default'
              : isActive
                ? 'bg-bzl-green-light/30 text-gray-900 font-medium cursor-pointer'
                : 'hover:bg-gray-100 text-gray-600 cursor-pointer'
          } ${item.level > 0 ? 'pl-4' : 'pl-2'}`}
          onClick={isHeader ? undefined : () => handleNavItemClick(item)}
        >
          {hasChildren && !isHeader && (
            <span className="mr-1 text-xs">
              <FontAwesomeIcon
                icon={isExpanded ? faChevronDown : faChevronRight}
                className="fa-solid"
              />
            </span>
          )}
          <span className="mr-2 text-xs">
            {getTypeIcon(item.type, item.label) && (
              <FontAwesomeIcon
                icon={getTypeIcon(item.type, item.label)!}
                className="fa-solid"
              />
            )}
          </span>
          <span
            className={`truncate text-bzl-green-dark ${
              item.level === 0 ? 'font-semibold' : ''
            }`}
          >
            {item.label}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="">
            {item.children!.map((child) => renderNavItem(child))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
      <nav className="space-y-1">
        {navStructure.map((item) => renderNavItem(item))}
      </nav>
    </aside>
  )
}
