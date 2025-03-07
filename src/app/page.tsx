import Link from 'next/link';
import { ArrowRight, Calendar, Star, Search, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-green-600 to-green-800 py-20 px-4 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">NextGenFut</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl">
              The ultimate platform for football enthusiasts to organize matches, rate performances, and discover new talents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/auth/register" 
                className="bg-white text-green-700 hover:bg-gray-100 px-6 py-3 rounded-md font-semibold text-lg transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/auth/login" 
                className="bg-transparent border-2 border-white hover:bg-white/10 px-6 py-3 rounded-md font-semibold text-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">User Profiles</h3>
              <p className="text-gray-600">
                Players, teams, and scouts can create and manage detailed profiles to showcase their abilities and interests.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Match Organization</h3>
              <p className="text-gray-600">
                Easily create, join, and manage football matches with friends or other players in your area.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Player Rating</h3>
              <p className="text-gray-600">
                After each game, players can rate each other's performances to build a reputation in the community.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Talent Discovery</h3>
              <p className="text-gray-600">
                Scouts can search, filter, and track players based on performance data to discover new talents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 px-4 bg-gray-100">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Ready to Join the Community?</h2>
          <p className="text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
            Start organizing matches, rating performances, and discovering new talents today.
          </p>
          <Link 
            href="/auth/register" 
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold text-lg transition-colors"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
