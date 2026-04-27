"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ProfileHeader() {
  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground font-body">Manage your student profile and details</p>
      </div>
      
      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 px-3 py-1 font-medium">
          Not verified
        </Badge>
        
        <div className="flex items-center bg-card rounded-md shadow-button border border-border overflow-hidden">
          <Button className="btn-primary rounded-r-none h-9 px-4 border-none shadow-none">
            Verify now
          </Button>
          <Separator orientation="vertical" className="h-4 bg-white/20" />
          <DropdownMenu>
            <DropdownMenuTrigger 
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9 rounded-l-none hover:bg-accent/50 border-none focus-visible:ring-0"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-modal">
              <DropdownMenuItem className="cursor-pointer">Download PDF</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Privacy Settings</DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem className="text-destructive cursor-pointer">Reset Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}