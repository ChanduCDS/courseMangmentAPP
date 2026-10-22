import { Link } from 'react-router-dom'
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-primary-600">404</p>
      <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
      <p className="text-secondary-500 mt-1">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  )
}
