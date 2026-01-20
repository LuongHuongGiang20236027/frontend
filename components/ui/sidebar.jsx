'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { PanelLeftIcon } from 'lucide-react'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

const SidebarContext = React.createContext(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }
  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = React.useCallback(
    (value) => {
      const next = typeof value === 'function' ? value(open) : value
      onOpenChange ? onOpenChange(next) : _setOpen(next)

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [open, onOpenChange],
  )

  const toggleSidebar = React.useCallback(() => {
    isMobile
      ? setOpenMobile((v) => !v)
      : setOpen((v) => !v)
  }, [isMobile, setOpen])

  React.useEffect(() => {
    const handler = (e) => {
      if (
        e.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleSidebar])

  const state = open ? 'expanded' : 'collapsed'

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }}
    >
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={{
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            ...style,
          }}
          className={cn(
            'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === 'none') {
    return (
      <div className="bg-sidebar w-(--sidebar-width)" {...props}>
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="bg-sidebar w-(--sidebar-width) p-0 [&>button]:hidden"
          style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Mobile sidebar</SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      className="group peer hidden md:block"
    >
      <div className="w-(--sidebar-width)" />
      <div
        className={cn(
          'fixed inset-y-0 z-10 w-(--sidebar-width) transition-all md:flex',
          side === 'left' ? 'left-0' : 'right-0',
          className,
        )}
        {...props}
      >
        <div className="bg-sidebar flex h-full w-full flex-col">
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn('size-7', className)}
      onClick={(e) => {
        onClick?.(e)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
    </Button>
  )
}

/* ---------- MENU BUTTON VARIANTS ---------- */

const sidebarMenuButtonVariants = cva(
  'flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-sidebar-accent',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border',
      },
      size: {
        default: 'h-8',
        sm: 'h-7 text-xs',
        lg: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  tooltip,
  variant,
  size,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : 'button'
  const { state, isMobile } = useSidebar()

  const button = (
    <Comp
      data-active={isActive}
      className={cn(
        sidebarMenuButtonVariants({ variant, size }),
        className,
      )}
      {...props}
    />
  )

  if (!tooltip) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        hidden={state !== 'collapsed' || isMobile}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

/* ---------- EXPORTS ---------- */

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuButton,
  useSidebar,
}
