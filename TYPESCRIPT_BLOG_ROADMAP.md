# TypeScript Full-Stack Blog Learning Roadmap

A comprehensive guide to building a full-stack blog application while learning TypeScript.

**Tech Stack:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js with Google OAuth
- **ORM:** Prisma (for type-safe database operations)

---

## Overview

This roadmap is structured in **6 phases**, each building upon the previous. Each phase introduces new TypeScript concepts while creating actual features for your blog.

**Estimated Time:** 6-8 weeks (part-time)

---

## Phase 1: Project Setup & TypeScript Basics

**Goal:** Initialize the project and understand fundamental TypeScript types

### Week 1: Initialization & Core Concepts

#### Day 1: Project Setup
```bash
# Initialize Next.js with TypeScript
npx create-next-app@latest blog --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"

# Install essential packages
npm install prisma @prisma/client @supabase/supabase-js
npm install -D @types/node

# Initialize Prisma
npx prisma init
```

**TypeScript Concepts to Learn:**
- TypeScript configuration (`tsconfig.json`)
- Basic primitive types: `string`, `number`, `boolean`
- Type inference
- Explicit type annotations

#### Day 2: Understanding Project Structure
**Tasks:**
- Explore the generated TypeScript files
- Understand `strict: true` in `tsconfig.json`
- Read Next.js TypeScript documentation

**TypeScript Concepts:**
- Module system (`import/export`)
- File extensions (`.ts`, `.tsx`)
- Type checking in development

#### Day 3: First Components with Types
**Create:**
- `components/ui/Button.tsx` - Typed button component
- `components/ui/Input.tsx` - Typed input component

**TypeScript Concepts:**
- Interface definitions
- Props typing in React
- Optional props with `?`
- Default values with type safety

**Example:**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary',
  onClick,
  disabled = false
}: ButtonProps) {
  // Implementation
}
```

#### Day 4: Types Directory
**Create:** `types/index.ts`
- Define common types used across app
- Export reusable interfaces

**TypeScript Concepts:**
- `export type` vs `export interface`
- Type aliases
- Combining interfaces

#### Day 5-7: Basic Layout & Navigation
**Build:**
- `app/layout.tsx` with typed props
- `app/page.tsx` (Home page)
- `components/Navbar.tsx` with typed navigation items

**TypeScript Concepts:**
- Generic React types (`React.FC` - avoid, prefer explicit)
- `ReactNode` vs `ReactElement`
- Array types and object types

**Weekly Checkpoint:**
- [ ] Can define interfaces for component props
- [ ] Understand type inference vs explicit types
- [ ] Can export/import types between files

---

## Phase 2: Database Design & Type Safety

**Goal:** Connect to Supabase and master type-safe database operations

### Week 2: Supabase Integration & Prisma

#### Day 1: Supabase Setup
**Tasks:**
1. Create Supabase project at https://supabase.com
2. Get credentials (URL and anon key)
3. Set up environment variables

**File:** `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

**TypeScript Concepts:**
- Environment variable typing
- Type guards for env vars
- Non-null assertion operator (`!`)

#### Day 2: Prisma Schema Definition
**Create:** `prisma/schema.prisma`

**Define Models:**
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  posts         Post[]
  comments      Comment[]
}

model Post {
  id          String    @id @default(uuid())
  title       String
  slug        String    @unique
  content     String
  published   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  authorId    String
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments    Comment[]
}

model Comment {
  id        String   @id @default(uuid())
  content   String
  createdAt DateTime @default(now())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

**TypeScript Concepts:**
- Prisma generates types automatically
- Understanding generated types
- Database type mappings

#### Day 3: Database Client Setup
**Create:** `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**TypeScript Concepts:**
- Global type augmentation
- Singleton pattern with types
- Type assertions (`as` keyword)

#### Day 4-5: Type-Safe Data Access Functions
**Create:** `lib/data.ts`

**Build functions with explicit return types:**
```typescript
import { prisma } from './prisma'
import type { Post, User, Comment } from '@prisma/client'

// Include relations type
export type PostWithAuthor = Post & {
  author: Pick<User, 'id' | 'name' | 'image'>
  _count: {
    comments: number
  }
}

export async function getPosts(): Promise<PostWithAuthor[]> {
  return await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: { id: true, name: true, image: true }
      },
      _count: {
        select: { comments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getPostBySlug(slug: string): Promise<PostWithAuthor | null> {
  return await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, image: true }
      },
      _count: {
        select: { comments: true }
      }
    }
  })
}
```

**TypeScript Concepts:**
- Prisma generated types
- Custom type definitions with `type`
- Generic type parameters
- `Pick` and `Omit` utility types
- Nullable return types
- Type inference vs explicit returns

#### Day 6-7: Display Posts
**Create:**
- `components/PostCard.tsx` - Typed component displaying post preview
- `components/PostList.tsx` - Array of PostCard components
- Update `app/page.tsx` to fetch and display posts

**TypeScript Concepts:**
- Prop drilling with types
- Array.map() with typed arrays
- Optional chaining (`?.`)
- Nullish coalescing (`??`)

**Weekly Checkpoint:**
- [ ] Prisma schema defined
- [ ] Type-safe database queries working
- [ ] Understanding generated types from Prisma
- [ ] Can create custom composite types

---

## Phase 3: API Routes & Request/Response Typing

**Goal:** Build type-safe API endpoints with Next.js App Router

### Week 3: Server-Side Type Safety

#### Day 1: API Route Structure
**Create:** `app/api/posts/route.ts`

**Build GET endpoint with proper typing:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPosts } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    const posts = await getPosts()
    return NextResponse.json({ posts }, { status: 200 })
  } catch (error) {
    // Type-safe error handling
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
```

**TypeScript Concepts:**
- Next.js API route types
- `NextRequest` and `NextResponse`
- Generic type parameters in NextResponse
- Error type narrowing

#### Day 2: POST Endpoint with Validation
**Create:** POST handler with Zod validation

```bash
npm install zod
```

**Build:**
```typescript
import { z } from 'zod'

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean().default(false)
})

// Infer TypeScript type from Zod schema
export type CreatePostInput = z.infer<typeof createPostSchema>

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Runtime validation with type inference
    const validated = createPostSchema.parse(body)
    
    // Now TypeScript knows validated has correct types
    const post = await prisma.post.create({
      data: {
        ...validated,
        slug: slugify(validated.title),
        authorId: 'temp' // Will integrate auth later
      }
    })
    
    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      )
    }
    // Handle other errors...
  }
}
```

**TypeScript Concepts:**
- `zod` for runtime validation + type inference
- `z.infer<>` to derive types
- Discriminated unions for error handling
- Custom error types

#### Day 3: API Response Types
**Create:** `types/api.ts`

```typescript
// Generic API response type
export type ApiResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; code: string }

// Specific response types
export interface PostsResponse {
  posts: PostWithAuthor[]
}

export interface PostResponse {
  post: PostWithAuthor
}
```

**TypeScript Concepts:**
- Generic types with defaults
- Discriminated unions (`success: true/false`)
- Interface composition
- Type exports

#### Day 4: Client-Side Fetching with Types
**Create:** `lib/api.ts`

```typescript
export async function fetchPosts(): Promise<PostWithAuthor[]> {
  const response = await fetch('/api/posts')
  
  if (!response.ok) {
    throw new Error('Failed to fetch posts')
  }
  
  const data: ApiResponse<PostsResponse> = await response.json()
  
  if (!data.success) {
    throw new Error(data.error)
  }
  
  return data.data.posts
}
```

**TypeScript Concepts:**
- `fetch` response typing
- Type assertions with API responses
- Async/await typing
- Error throwing and catching

#### Day 5-7: Dynamic Routes & Params
**Create:** `app/api/posts/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = params
  
  // Type-safe ID usage
  const post = await getPostById(id)
  
  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({ post })
}
```

**Build:**
- Individual post page with types
- Post detail component
- Loading states with types

**TypeScript Concepts:**
- Route parameter typing
- Dynamic route segments
- Type guards for null checks
- Loading/Error state types

**Weekly Checkpoint:**
- [ ] Type-safe API routes implemented
- [ ] Zod validation working with type inference
- [ ] Client-side fetching typed correctly
- [ ] Can handle errors in a type-safe manner

---

## Phase 4: Forms & Advanced Types

**Goal:** Build forms with complete type safety and validation

### Week 4: Forms & User Input

#### Day 1: Form State Types
**Create:** `types/forms.ts`

```typescript
// Generic form state
export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
}

// Post form specific types
export interface PostFormData {
  title: string
  content: string
  published: boolean
}

// Union type for form actions
export type FormAction = 
  | { type: 'UPDATE_FIELD'; field: keyof PostFormData; value: string | boolean }
  | { type: 'SET_ERRORS'; errors: Partial<Record<keyof PostFormData, string>> }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
```

**TypeScript Concepts:**
- `keyof` operator
- `Record` utility type
- Partial types
- Discriminated unions for actions

#### Day 2: Custom Hook with Generics
**Create:** `hooks/useForm.ts`

```typescript
import { useState, useCallback } from 'react'

interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => Promise<void>
}

interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  handleChange: (field: keyof T, value: any) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // Clear error when field is modified
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate) {
      const validationErrors = validate(values)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit])

  return { values, errors, isSubmitting, handleChange, handleSubmit }
}
```

**TypeScript Concepts:**
- Generic hooks with constraints (`extends Record<string, any>`)
- `keyof` with generics
- `Partial` utility type
- Callback hook typing
- Return type declarations

#### Day 3-4: Post Form Component
**Create:** `components/PostForm.tsx`

```typescript
interface PostFormProps {
  initialValues?: PostFormData
  onSubmit: (data: PostFormData) => Promise<void>
  onCancel?: () => void
}

export function PostForm({ 
  initialValues = { title: '', content: '', published: false },
  onSubmit,
  onCancel 
}: PostFormProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues,
    validate: (values) => {
      const errors: Partial<Record<keyof PostFormData, string>> = {}
      if (!values.title.trim()) errors.title = 'Title is required'
      if (!values.content.trim()) errors.content = 'Content is required'
      return errors
    },
    onSubmit
  })

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with types */}
    </form>
  )
}
```

**TypeScript Concepts:**
- Component props interfaces
- Default prop values with types
- Event handler types (`React.FormEvent`)
- Optional chaining for optional props

#### Day 5: Comments System
**Create:** Comment-related types and components

**Types:**
```typescript
// types/comments.ts
export interface CommentFormData {
  content: string
  postId: string
}

export interface CommentWithAuthor extends Comment {
  author: Pick<User, 'id' | 'name' | 'image'>
}
```

**Components:**
- `components/CommentList.tsx`
- `components/CommentForm.tsx`
- `components/CommentItem.tsx`

**TypeScript Concepts:**
- Interface extension (`extends`)
- Recursive component typing
- Type composition

#### Day 6-7: Advanced Form Patterns
**Implement:**
- Controlled vs uncontrolled inputs
- Form reset functionality
- Field arrays (for advanced features)

**TypeScript Concepts:**
- Type guards
- Type assertions
- Conditional types
- Mapped types

**Weekly Checkpoint:**
- [ ] Generic useForm hook working
- [ ] Forms fully typed with validation
- [ ] Comments system implemented
- [ ] Understand generics in React hooks

---

## Phase 5: Authentication & Context

**Goal:** Implement Google OAuth with NextAuth.js and typed context

### Week 5: Auth & Protected Routes

#### Day 1: NextAuth.js Setup
**Install:**
```bash
npm install next-auth
npm install -D @types/next-auth
```

**Create:** `auth.ts`

```typescript
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    }
  },
  session: {
    strategy: 'jwt'
  }
})
```

**TypeScript Concepts:**
- Module augmentation (extending next-auth types)
- Environment variable types
- Callback function typing
- Generic configuration types

#### Day 2: Type Augmentation for Auth
**Create:** `types/next-auth.d.ts`

```typescript
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
  }
}
```

**TypeScript Concepts:**
- Module augmentation (`declare module`)
- Extending external library types
- Declaration merging
- Ambient declarations

#### Day 3: Auth Context
**Create:** `components/providers/AuthProvider.tsx`

```typescript
'use client'

import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

interface AuthProviderProps {
  children: React.ReactNode
  session?: Session | null
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
```

**TypeScript Concepts:**
- React Context typing
- Session type from next-auth
- Provider component patterns

#### Day 4: Custom Auth Hook
**Create:** `hooks/useAuth.ts`

```typescript
import { useSession, signIn, signOut } from 'next-auth/react'
import type { User } from 'next-auth'

interface UseAuthReturn {
  user: User | undefined
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (provider: string) => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    signIn: async (provider) => {
      await signIn(provider, { callbackUrl: '/dashboard' })
    },
    signOut: async () => {
      await signOut({ callbackUrl: '/' })
    }
  }
}
```

**TypeScript Concepts:**
- Hook return type interfaces
- Nullish coalescing for booleans
- Type-safe async functions

#### Day 5-6: Protected Routes
**Create:** `middleware.ts`

```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  const protectedPaths = ['/dashboard', '/posts/create', '/posts/edit']
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

**Create:** Protected client components
```typescript
// components/Protected.tsx
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface ProtectedProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Protected({ children, fallback }: ProtectedProps) {
  const { status } = useSession()
  
  if (status === 'loading') {
    return <>{fallback || <LoadingSpinner />}</>
  }
  
  if (status === 'unauthenticated') {
    redirect('/login')
  }
  
  return <>{children}</>
}
```

**TypeScript Concepts:**
- Next.js middleware typing
- Redirect function types
- Component conditional rendering types
- Union types for status

#### Day 7: Authorization Guards
**Create:** Permission checking utilities

```typescript
// lib/auth.ts
import { auth } from '@/auth'

export async function requireAuth() {
  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requirePostOwner(postId: string) {
  const session = await requireAuth()
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true }
  })
  
  if (!post || post.authorId !== session.user.id) {
    throw new Error('Forbidden')
  }
}
```

**TypeScript Concepts:**
- Async function error handling
- Session return typing
- Type narrowing after auth check

**Weekly Checkpoint:**
- [ ] NextAuth integrated with TypeScript
- [ ] Module augmentation working
- [ ] Protected routes implemented
- [ ] Auth context properly typed

---

## Phase 6: Polish & Advanced Patterns

**Goal:** Add finishing touches and learn advanced TypeScript patterns

### Week 6: Advanced Features & Optimization

#### Day 1: Utility Types Masterclass
**Create:** `lib/types.ts`

```typescript
// Re-export and extend utility types
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Generic type for API list responses
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Conditional types
export type Status = 'loading' | 'success' | 'error'

type LoadingState = {
  status: 'loading'
}

type SuccessState<T> = {
  status: 'success'
  data: T
}

type ErrorState = {
  status: 'error'
  error: string
}

export type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState

// Type guard functions
export function isLoading<T>(state: AsyncState<T>): state is LoadingState {
  return state.status === 'loading'
}

export function isSuccess<T>(state: AsyncState<T>): state is SuccessState<T> {
  return state.status === 'success'
}

export function isError<T>(state: AsyncState<T>): state is ErrorState {
  return state.status === 'error'
}
```

**TypeScript Concepts:**
- Custom utility types
- Conditional types
- Type guards with predicates (`is` keyword)
- Discriminated unions with type guards
- Generic constraints

#### Day 2: Advanced Component Patterns
**Create:** Higher-order components and render props with types

```typescript
// HOC for loading states
import { ComponentType } from 'react'

interface WithLoadingProps {
  isLoading: boolean
}

export function withLoading<T extends object>(
  WrappedComponent: ComponentType<T>
): ComponentType<T & WithLoadingProps> {
  return function WithLoadingComponent({ isLoading, ...props }: T & WithLoadingProps) {
    if (isLoading) {
      return <LoadingSpinner />
    }
    return <WrappedComponent {...props as T} />
  }
}

// Render props pattern
interface DataFetcherProps<T> {
  url: string
  children: (data: T | null, error: Error | null, loading: boolean) => React.ReactNode
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setState({ status: 'success', data }))
      .catch(error => setState({ status: 'error', error: error.message }))
  }, [url])
  
  return <>
    {isSuccess(state) && children(state.data, null, false)}
    {isError(state) && children(null, new Error(state.error), false)}
    {isLoading(state) && children(null, null, true)}
  </>
}
```

**TypeScript Concepts:**
- Higher-order component typing
- ComponentType from React
- Render props with generics
- Type inference with HOCs

#### Day 3: Error Boundaries
**Create:** `components/ErrorBoundary.tsx`

```typescript
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>
    }

    return this.props.children
  }
}
```

**TypeScript Concepts:**
- Class component typing
- Component lifecycle types
- Optional props handling
- ErrorInfo type

#### Day 4: Performance Optimization
**Create:** Optimized components with proper typing

```typescript
// Memoized list component
import { memo } from 'react'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
  itemHeight: number
  containerHeight: number
}

function VirtualListInner<T>({
  items,
  renderItem,
  keyExtractor,
  itemHeight,
  containerHeight
}: VirtualListProps<T>) {
  // Implementation...
  return <div>{/* Virtualized content */}</div>
}

// Memoized with generic support
export const VirtualList = memo(VirtualListInner) as <T>(props: VirtualListProps<T>) => JSX.Element

// Type-safe debounced callback
import { useCallback, useRef } from 'react'

export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T
}
```

**TypeScript Concepts:**
- Generic component memoization
- Function parameter inference
- ReturnType utility
- NodeJS.Timeout type

#### Day 5-6: Testing with TypeScript
**Set up:** Jest + React Testing Library with types

```bash
npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom ts-jest
```

**Create tests with types:**

```typescript
// __tests__/components/PostCard.test.tsx
import { render, screen } from '@testing-library/react'
import { PostCard } from '@/components/PostCard'
import type { PostWithAuthor } from '@/types'

// Mock data with proper types
const mockPost: PostWithAuthor = {
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  slug: 'test-post',
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  authorId: '1',
  author: {
    id: '1',
    name: 'Test User',
    image: null
  },
  _count: { comments: 5 }
}

describe('PostCard', () => {
  it('renders post information correctly', () => {
    render(<PostCard post={mockPost} />)
    
    expect(screen.getByText(mockPost.title)).toBeInTheDocument()
    expect(screen.getByText(/Test User/)).toBeInTheDocument()
  })
  
  it('handles missing author name gracefully', () => {
    const postWithoutName: PostWithAuthor = {
      ...mockPost,
      author: { ...mockPost.author, name: null }
    }
    
    render(<PostCard post={postWithoutName} />)
    expect(screen.getByText(/Anonymous/)).toBeInTheDocument()
  })
})
```

**TypeScript Concepts:**
- Test file typing
- Mock data types
- Assertion library types
- jest-dom matchers

#### Day 7: Final Review & Best Practices
**Review topics:**

1. **Type Safety Best Practices**
   - When to use `any` vs `unknown`
   - Avoiding `@ts-ignore`
   - Strict mode benefits
   - ESLint TypeScript rules

2. **Project Structure**
   ```
   /app
     /api              # API routes
     /dashboard        # Protected pages
     /posts           # Public post pages
     /(auth)          # Auth pages (group)
   /components
     /ui              # Reusable UI components
     /forms           # Form components
     /providers       # Context providers
   /hooks             # Custom hooks
   /lib               # Utilities
   /types             # Global types
   /__tests__         # Tests
   ```

3. **Final Checklist**
   - [ ] No `any` types without justification
   - [ ] All props typed
   - [ ] All API responses typed
   - [ ] All errors handled with types
   - [ ] Strict mode enabled
   - [ ] Type checking passes

**TypeScript Concepts:**
- `any` vs `unknown` usage
- Type assertion best practices
- Module organization
- Export patterns

---

## Project Structure

```
my-blog/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── posts/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── comments/
│   │       └── route.ts
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── posts/
│   │       ├── new/
│   │       │   └── page.tsx
│   │       └── [id]/
│   │           └── edit/
│   │               └── page.tsx
│   ├── posts/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── loading.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── LoadingSpinner.tsx
│   ├── PostCard.tsx
│   ├── PostList.tsx
│   ├── PostDetail.tsx
│   ├── PostForm.tsx
│   ├── CommentList.tsx
│   ├── CommentForm.tsx
│   ├── CommentItem.tsx
│   ├── Navbar.tsx
│   └── Protected.tsx
├── hooks/
│   ├── useForm.ts
│   └── useAuth.ts
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── data.ts
│   ├── api.ts
│   └── utils.ts
├── types/
│   ├── index.ts
│   ├── api.ts
│   ├── forms.ts
│   └── comments.ts
├── __tests__/
│   ├── components/
│   └── hooks/
├── prisma/
│   └── schema.prisma
├── public/
├── .env.local
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── jest.config.js
└── package.json
```

---

## Key TypeScript Concepts by Phase

### Phase 1: Basics
- Type annotations (`: string`, `: number`)
- Interface definitions
- Props typing in React
- Optional properties (`?`)
- Type inference

### Phase 2: Database Types
- Prisma-generated types
- Custom type compositions (`type`, `interface`)
- `Pick`, `Omit`, `Partial` utilities
- Nullable types
- Array types

### Phase 3: API Types
- `NextRequest`, `NextResponse`
- Generic API responses
- Zod schema inference (`z.infer`)
- Discriminated unions
- Error type narrowing

### Phase 4: Forms
- Generic hooks (`<T extends Record<string, any>>`)
- `keyof` operator
- Type-safe event handlers
- Form state typing
- Validation types

### Phase 5: Auth
- Module augmentation (`declare module`)
- Context typing
- Session types
- Middleware types
- Type guards (`is` keyword)

### Phase 6: Advanced
- Conditional types
- Mapped types
- Higher-order components
- Generic constraints
- Type predicates

---

## Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Prisma with TypeScript](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [NextAuth.js](https://next-auth.js.org/)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play) - Experiment with types
- [Type Challenges](https://github.com/type-challenges/type-challenges) - Practice advanced types
- [Total TypeScript](https://www.totaltypescript.com/) - Comprehensive tutorials

### VS Code Extensions
- TypeScript Importer
- Error Lens
- Pretty TypeScript Errors

---

## Getting Started

1. **Create project directory:**
   ```bash
   mkdir my-blog
   cd my-blog
   ```

2. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Start with Phase 1, Day 1**

4. **Commit after each day** to track progress

5. **Run type checker regularly:**
   ```bash
   npx tsc --noEmit
   ```

6. **Ask questions in TypeScript communities:**
   - r/typescript
   - TypeScript Discord
   - Stack Overflow

---

## Success Metrics

By the end of this project, you should be able to:

- ✅ Write fully typed React components
- ✅ Create generic hooks and utilities
- ✅ Type API requests and responses
- ✅ Work with database-generated types
- ✅ Implement type-safe authentication
- ✅ Use advanced TypeScript patterns (generics, guards, unions)
- ✅ Debug type errors effectively
- ✅ Know when to use specific TypeScript features

---

## Next Steps After Completion

1. **Add more features:**
   - Search functionality
   - Tags/categories
   - Image uploads
   - Email notifications

2. **Learn more:**
   - TypeScript compiler API
   - Advanced generics
   - Template literal types
   - Mapped types

3. **Share your project:**
   - Deploy to Vercel
   - Write a blog post about what you learned
   - Open source the code

---

**Remember:** This is a learning journey. Take your time with each concept, experiment, and don't hesitate to look up documentation. TypeScript becomes more intuitive with practice!

**Estimated total time:** 6-8 weeks (part-time)
**Estimated lines of TypeScript:** 3,000-5,000

Good luck! 🚀
