'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { LogOut, User as UserIcon } from 'lucide-react'

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
)
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
import { useToast } from '@/hooks/use-toast'

export function AuthButton() {
    const { user, signInWithGoogle, signOut } = useAuth()
    const syncBookmarks = useMovieStore((state) => state.syncBookmarks)
    const clearState = useMovieStore((state) => state.clearState)
    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            syncBookmarks(user.uid)
        }
    }, [user, syncBookmarks])

    const handleSignIn = async () => {
        try {
            await signInWithGoogle()
            toast({
                title: "Signed in",
                description: "Welcome back!",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error signing in",
                description: "Please try again.",
            })
        }
    }

    const handleSignOut = async () => {
        await signOut()
        toast({
            title: "Signed out",
            description: "See you next time!",
        })
    }

    if (!user) {
        return (
            <Button onClick={handleSignIn} variant="outline" size="sm" className="gap-2">
                <GoogleIcon className="h-4 w-4" />
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
