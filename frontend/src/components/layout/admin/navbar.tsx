"use client"

import { useAppStore } from "@/store/useAppStore"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Bell, Search, Settings, User } from "lucide-react"

export function AdminNavbar() {
  const { user } = useAppStore()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-sidebar-border bg-card/50 backdrop-blur-md sticky top-0 z-30 shadow-subtle">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search jobs, students, applications..." 
            className="pl-10 pr-4 py-2 bg-muted/50 border-none rounded-lg text-sm w-80 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
          />
          <div className="absolute right-3 px-1.5 py-0.5 rounded border border-sidebar-border bg-card text-[10px] text-muted-foreground font-mono">
            ⌘K
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-error rounded-full border-2 border-card"></span>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger 
            render={
              <button className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-muted rounded-full transition-colors group outline-none" />
            }
          >
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground leading-tight">{user?.name || "Admin User"}</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{user?.role}</p>
              </div>
              <Avatar className="size-9 border-2 border-primary/10 group-hover:border-primary/30 transition-all shadow-subtle">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                  {user?.email?.substring(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <User className="size-4" /> Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Settings className="size-4" /> System Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer text-error focus:text-error focus:bg-error/10">
                <LogOut className="size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function LogOut(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}
