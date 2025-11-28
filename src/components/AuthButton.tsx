'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMovieStore } from '@/store/movie-store'
import { useEffect } from 'react'

export function AuthButton() {
    const { user, signInWithGoogle, signOut } = useAuth()
    const syncBookmarks = useMovieStore((state) => state.syncBookmarks)
    const clearState = useMovieStore((state) => state.clearState)

    useEffect(() => {
        if (user) {
            syncBookmarks(user.uid)
        }
    }, [user, syncBookmarks])

    const handleSignOut = async () => {
        await signOut()
        // Optional: clear bookmarks on sign out or keep them?
        // clearState() // Maybe too aggressive if we want to keep local state?
        // Let's just keep them for now or maybe clear bookmarks only?
        // For now, standard behavior is often to keep local data or clear it.
        // Let's leave it as is.
    }

    if (!user) {
        return (
            <Button onClick={signInWithGoogle} variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
