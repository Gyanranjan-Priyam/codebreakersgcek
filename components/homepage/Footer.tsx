import { Github, Instagram, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FaDiscord, FaLinkedin, FaYoutube, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12 mb-8">
          {/* Left Side - College Info */}
          <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
            {/* GCEK */}
            <div className="flex flex-col items-center gap-3">
              <Image
                src="/assets/gcek_logo.png"
                alt="GCEK Logo"
                width={60}
                height={60}
                className="object-contain md:w-20 md:h-20"
              />
              <div className="space-y-1 flex flex-col items-center">
                <Link href="https://gcek.ac.in" target="_blank" className="text-sm md:text-base font-semibold text-white leading-tight text-center">
                  Government College of Engineering, Kalahandi
                </Link>
                <p className="text-xs md:text-sm text-gray-400 text-center">Bhawanipatna</p>
              </div>
            </div>

            {/* INSPRANO */}
            <div className="flex flex-col items-center gap-3 sm:ml-0 md:ml-8">
              <Image
                src="/assets/insprano-logo.png"
                alt="INSPRANO Logo"
                width={60}
                height={60}
                className="object-contain md:w-20 md:h-20"
              />
              <div className="space-y-1 flex flex-col items-center">
                <Link href="https://insprano.netlify.app" target="_blank" className="text-sm md:text-base font-semibold text-white leading-tight text-center">
                  INSPRANO
                </Link>
                <p className="text-xs md:text-sm text-gray-400 text-center">Premier and annual TechFest of GCEK</p>
              </div>
            </div>
          </div>

          {/* Right Side - Resources and Community (Close Together) */}
          <div className="flex gap-12 sm:gap-16 md:gap-20 w-full md:w-auto justify-center md:justify-end md:mr-20">
            {/* Resources Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#blog" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/CodeBreakersGCEK" className="text-sm text-gray-400 hover:text-white transition-colors">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="#learning" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Learning Hub
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider">Community</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Join the Club
                  </Link>
                </li>
                <li>
                  <Link href="#volunteer" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Volunteer
                  </Link>
                </li>
                <li>
                  <Link href="#sponsorship" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Sponsorship
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - CodeBreakers Large Text */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
          {/* Large CodeBreakers Text */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Image 
              src="/assets/logo.png" 
              alt="CodeBreakers Logo" 
              width={80} 
              height={80}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain"
            />
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight text-center">
              CodeBreakers
            </h1>
          </div>

          {/* Footer Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-800">
            {/* Left Side - Copyright and Links */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-gray-500">
              <span>CodeBreakers © {currentYear}</span>
              <Link href="#manage" className="hover:text-gray-300 transition-colors underline">
                Manage cookies
              </Link>
            </div>

            {/* Right Side - Social Icons */}
            <div className="flex items-center gap-3">
              <Link
                href="https://x.com/CodeBreakersGCE"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <FaXTwitter className="w-4 h-4" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/codebreakers-gcek/posts/?feedView=all"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
              </Link>
              <Link
                href="https://github.com/CodeBreakersGCEK"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </Link>
              <Link
                href="https://www.instagram.com/codebreakersgcek"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </Link>
              <Link
                href="https://discord.gg/xEKTxqJygC"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Discord"
              >
                <FaDiscord className="w-4 h-4" />
              </Link>
              <button
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                aria-label="Language"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs">English (US)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}