'use client';

import Link from 'next/link';
import { GlowingHeading } from '@/components/ui/glowing-heading';
import { PremiumCard } from '@/components/ui/premium-card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
        <div className="text-2xl font-bold text-gray-900">STRATIX</div>
        <div className="flex gap-6">
          <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-24 text-center max-w-6xl mx-auto">
        <GlowingHeading className="mb-6">
          Strategic Intelligence Platform
        </GlowingHeading>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Transform your market research into actionable strategic insights. Analyze competitors,
          discover opportunities, and position your product for success.
        </p>
        <Link
          href="/auth/signup"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Start Free Trial
        </Link>
      </section>

      {/* Features Section */}
      <section className="px-8 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PremiumCard>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Intelligent Context Engine
              </h3>
              <p className="text-gray-600">
                Automatically extract and structure your business context from multiple sources.
              </p>
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Competitor Intelligence
              </h3>
              <p className="text-gray-600">
                Discover and analyze competitors with AI-powered insights and positioning analysis.
              </p>
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Strategic Scoring
              </h3>
              <p className="text-gray-600">
                Get a comprehensive 0-20 score with actionable recommendations for improvement.
              </p>
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Market Mapping
              </h3>
              <p className="text-gray-600">
                Visualize market segments and identify whitespace opportunities automatically.
              </p>
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Positioning Engine
              </h3>
              <p className="text-gray-600">
                Generate differentiated positioning statements and messaging frameworks.
              </p>
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Public Reports
              </h3>
              <p className="text-gray-600">
                Publish and share strategic briefs with stakeholders and the public.
              </p>
            </PremiumCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-24 text-center max-w-4xl mx-auto">
        <GlowingHeading level="h2" className="mb-6">
          Ready to Transform Your Strategy?
        </GlowingHeading>
        <p className="text-lg text-gray-600 mb-8">
          Join leading companies using STRATIX to make data-driven strategic decisions.
        </p>
        <Link
          href="/auth/signup"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Start Your Free Trial
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-8 py-12 text-center text-gray-600">
        <p>&copy; 2024 STRATIX AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
