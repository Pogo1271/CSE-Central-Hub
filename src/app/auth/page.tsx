'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Calculate password strength
  useEffect(() => {
    if (authMode === 'signup' && signupForm.password) {
      const strength = calculatePasswordStrength(signupForm.password)
      setPasswordStrength(strength.score)
      setPasswordFeedback(strength.feedback)
    }
  }, [signupForm.password, authMode])

  const calculatePasswordStrength = (password: string) => {
    let score = 0
    let feedback = []

    if (password.length >= 8) score += 25
    else feedback.push('Use at least 8 characters')

    if (password.length >= 12) score += 25
    else if (password.length >= 8) feedback.push('Consider 12+ characters for stronger security')

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25
    else feedback.push('Use both uppercase and lowercase letters')

    if (/\d/.test(password)) score += 12.5
    else feedback.push('Add numbers')

    if (/[^A-Za-z0-9]/.test(password)) score += 12.5
    else feedback.push('Add special characters')

    return {
      score: Math.min(100, score),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Strong password!'
    }
  }

  const getPasswordColor = (score: number) => {
    if (score < 40) return 'bg-red-500'
    if (score < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const validateForm = (type: 'login' | 'signup') => {
    const errors: Record<string, string> = {}
    
    if (type === 'login') {
      if (!loginForm.email) errors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errors.email = 'Please enter a valid email'
      if (!loginForm.password) errors.password = 'Password is required'
    } else {
      if (!signupForm.name) errors.name = 'Name is required'
      else if (signupForm.name.length < 2) errors.name = 'Name must be at least 2 characters'
      
      if (!signupForm.email) errors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errors.email = 'Please enter a valid email'
      
      if (!signupForm.password) errors.password = 'Password is required'
      else if (signupForm.password.length < 8) errors.password = 'Password must be at least 8 characters'
      
      if (!signupForm.confirmPassword) errors.confirmPassword = 'Please confirm your password'
      else if (signupForm.password !== signupForm.confirmPassword) errors.confirmPassword = 'Passwords do not match'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm('login')) return
    
    setIsLoading(true)
    setFormErrors({})
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => {
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('currentUser', JSON.stringify(data.user))
          window.location.href = '/'
        }, 1500)
      } else {
        setFormErrors({ general: data.error || 'Login failed. Please check your credentials.' })
      }
    } catch (error) {
      setFormErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm('signup')) return
    
    setIsLoading(true)
    setFormErrors({})
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => {
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('currentUser', JSON.stringify(data.user))
          window.location.href = '/'
        }, 1500)
      } else {
        setFormErrors({ general: data.error || 'Registration failed. Please try again.' })
      }
    } catch (error) {
      setFormErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (role: string) => {
    const demoAccounts = {
      admin: { email: 'admin@businesshub.com', password: 'admin123' },
      manager: { email: 'manager@businesshub.com', password: 'manager123' },
      user: { email: 'user@businesshub.com', password: 'user123' }
    }
    
    setLoginForm(demoAccounts[role as keyof typeof demoAccounts])
    setAuthMode('login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300 rounded-full opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        {/* Left side - Welcome information */}
        <div className="flex flex-col justify-center space-y-6 animate-fade-in">
          <div className="text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-600 border border-gray-200">
              <Shield className="h-4 w-4 text-green-600" />
              Secure Authentication
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Welcome to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Business Hub
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your comprehensive platform for managing businesses, teams, and analytics with enterprise-grade security.
            </p>
          </div>

          <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Building2 className="h-5 w-5 text-blue-600" />
                Get Started
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in with your existing account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Demo Accounts Available
                  </h3>
                  <div className="space-y-3">
                    {[
                      { role: 'Admin', email: 'admin@businesshub.com', password: 'admin123', color: 'bg-red-100 text-red-800 border-red-200' },
                      { role: 'Manager', email: 'manager@businesshub.com', password: 'manager123', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                      { role: 'User', email: 'user@businesshub.com', password: 'user123', color: 'bg-blue-100 text-blue-800 border-blue-200' }
                    ].map((account, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${account.color}`}
                        onClick={() => handleDemoLogin(account.role.toLowerCase())}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{account.role}</div>
                            <div className="text-sm opacity-75">{account.email}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Click to fill
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center lg:text-left text-sm text-gray-500 space-y-2">
            <p>
              <span className="inline-flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                New users will be created with basic permissions
              </span>
            </p>
            <p>
              <span className="inline-flex items-center gap-1">
                <Shield className="h-3 w-3 text-blue-600" />
                Administrators can upgrade user roles as needed
              </span>
            </p>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex items-center justify-center animate-fade-in-right">
          <Card className="w-full max-w-md border-0 bg-white/80 backdrop-blur-sm shadow-xl transform transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Get Started</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Success Animation */}
              {showSuccess && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in-smooth">
                  <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center transform animate-scale-in-smooth shadow-2xl">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome!</h3>
                    <p className="text-gray-600">Redirecting to your dashboard...</p>
                  </div>
                </div>
              )}

              <Tabs value={authMode} onValueChange={setAuthMode} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger 
                    value="login" 
                    className="transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* Error Message */}
                {formErrors.general && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 animate-slide-down">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">{formErrors.general}</span>
                  </div>
                )}

                <TabsContent value="login" className="space-y-4 animate-fade-in">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                          className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.email ? 'border-red-300 focus:ring-red-500' : ''
                          }`}
                          required
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-sm text-red-600 animate-slide-down">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          className={`pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.password ? 'border-red-300 focus:ring-red-500' : ''
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="text-sm text-red-600 animate-slide-down">{formErrors.password}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-gray-200"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-gray-200"
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.404-5.965 1.404-5.965s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.381-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.017 0z"/>
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 animate-fade-in">
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={signupForm.name}
                          onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                          className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.name ? 'border-red-300 focus:ring-red-500' : ''
                          }`}
                          required
                        />
                      </div>
                      {formErrors.name && (
                        <p className="text-sm text-red-600 animate-slide-down">{formErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                          className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.email ? 'border-red-300 focus:ring-red-500' : ''
                          }`}
                          required
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-sm text-red-600 animate-slide-down">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-company" className="text-sm font-medium text-gray-700">
                        Company (Optional)
                      </Label>
                      <div className="relative group">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="signup-company"
                          type="text"
                          placeholder="Enter your company name"
                          value={signupForm.company}
                          onChange={(e) => setSignupForm({...signupForm, company: e.target.value})}
                          className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                          className={`pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.password ? 'border-red-300 focus:ring-red-500' : ''
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {signupForm.password && (
                        <div className="space-y-2 animate-slide-down">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Password strength</span>
                            <span className={`font-medium ${
                              passwordStrength < 40 ? 'text-red-600' :
                              passwordStrength < 70 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {passwordStrength < 40 ? 'Weak' :
                               passwordStrength < 70 ? 'Fair' :
                               'Strong'}
                            </span>
                          </div>
                          <Progress 
                            value={passwordStrength} 
                            className="h-2 bg-gray-200"
                          />
                          <p className="text-xs text-gray-500">
                            {passwordFeedback}
                          </p>
                        </div>
                      )}
                      
                      {formErrors.password && (
                        <p className="text-sm text-red-600 animate-slide-down">{formErrors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                          className={`pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-sm text-red-600 animate-slide-down">{formErrors.confirmPassword}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-gray-200"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-gray-200"
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.404-5.965 1.404-5.965s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.381-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.017 0z"/>
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}