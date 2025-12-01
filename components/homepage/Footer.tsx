import { Github, Instagram } from "lucide-react";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

export default function FooterSection() {
  return (
   
<footer className="bg-[#121212] text-gray-400 py-10">
  <div className="container mx-auto px-6 md:px-12">
    {/* Top Section: Logo and Links */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      {/* Logo and Description */}
      <div className="mb-6 md:mb-0">
        <h2 className="text-3xl font-thin text-white">Codebreakers</h2>
        <p className="mt-3 max-w-sm text-sm">
          Unleash your coding potential with us. Join a community that values innovation, collaboration, and learning.
        </p>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-wrap gap-12">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li className="hover:text-white transition-colors"><a href="/about">About Us</a></li>
            <li className="hover:text-white transition-colors"><a href="/events">Events</a></li>
            <li className="hover:text-white transition-colors"><a href="/workshops">Workshops</a></li>
            <li className="hover:text-white transition-colors"><a href="/projects">Projects</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Resources</h3>
          <ul className="space-y-2">
            <li className="hover:text-white transition-colors"><a href="#blog">Blog</a></li>
            <li className="hover:text-white transition-colors"><a href="#github">GitHub</a></li>
            <li className="hover:text-white transition-colors"><a href="#learning">Learning Hub</a></li>
            <li className="hover:text-white transition-colors"><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Get Involved</h3>
          <ul className="space-y-2">
            <li className="hover:text-white transition-colors"><a href="#join">Join the Club</a></li>
            <li className="hover:text-white transition-colors"><a href="#volunteer">Volunteer</a></li>
            <li className="hover:text-white transition-colors"><a href="#sponsorship">Sponsorship</a></li>
            <li className="hover:text-white transition-colors"><a href="#contact">Contact Us</a></li>
          </ul>
        </div>
      </div>
    </div>

    {/* Middle Section: Social Media */}
    <div className="flex justify-start mb-8 w-full">
      <div className="text-lg font-semibold text-white space-y-3">
        <h3>Follow Us</h3>
        <ul className="flex space-x-3">
          <Link href={'https://github.com/CodeBreakersGCEK'}><Github/></Link>
          <Link href={'https://www.instagram.com/codebreakersgcek?igsh=MWJveDQ0dDg4Y2pvdQ=='}><Instagram/></Link>
          <Link href={'https://discord.gg/xEKTxqJygC'}><FaDiscord/></Link>
        </ul>
        </div>
        
      <div className="flex gap-6">
        <Link href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-facebook-f"></i></Link>
        <Link href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-twitter"></i></Link>
        <Link href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-instagram"></i></Link>
        <Link href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-linkedin-in"></i></Link>
        <Link href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-github"></i></Link>
      </div>
    </div>

    {/* Bottom Section: Divider and Copyright */}
    <hr className="border-gray-700 mb-6" />
    <div className="flex flex-col md:flex-row justify-between items-center">
      <p className="text-sm">&copy; {new Date().getFullYear()} Codebreakers. All Rights Reserved.</p>
      <p className="text-sm mt-4 md:mt-0">
        Made with <span className="text-red-500">&hearts;</span> by the Codebreakers Team
      </p>
    </div>
  </div>
</footer>

  );
}