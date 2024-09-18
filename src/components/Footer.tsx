import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer
      style={{ backgroundColor: 'var(--bg-secondary)' }}
      className="py-12"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/press"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Products
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/blog"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Contact
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@example.com"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  support@example.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="hover:text-accent-color transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  +1 (234) 567-890
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="mt-12 pt-8 border-t border-opacity-10"
          style={{ borderColor: 'var(--text-secondary)' }}
        >
          <p className="text-center" style={{ color: 'var(--text-secondary)' }}>
            &copy; 2023 Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
