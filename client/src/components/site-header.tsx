import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  BookOpen,
  LogIn,
  LogOut,
  Shield,
  List,
} from "lucide-react";

export function SiteHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">KnowledgeBase</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/repository" className="text-sm font-medium transition-colors hover:text-primary">
                Repository
              </Link>
              {user?.isAdmin && (
                <Link href="/admin/topics" className="text-sm font-medium transition-colors hover:text-primary">
                  Manage Topics
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user?.isAdmin ? (
              <>
                <Button variant="ghost" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/admin/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}