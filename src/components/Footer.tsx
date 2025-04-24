"use client";

import React, { FC } from "react";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer: FC = () => {
    return (
        <footer className="flex flex-col items-center bg-gray-900 text-gray-300 text-sm p-8 gap-4">
            {/* Made with love */}
            <p className="text-center">
                Made with <span role="img" aria-label="love">❤️</span> by Aaryan Kumar
            </p>

            {/* Social icons */}
            <div className="flex gap-6" aria-label="Social Links">
                <a
                    href="https://github.com/AryanKumarOfficial/quiljs-demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="hover:text-blue-500 transition-colors"
                >
                    <FaGithub className="w-6 h-6" />
                </a>
                <a
                    href="https://x.com/_aryankofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="hover:text-blue-500 transition-colors"
                >
                    <FaTwitter className="w-6 h-6" />
                </a>
                <a
                    href="https://www.linkedin.com/in/aryankumarofficial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="hover:text-blue-500 transition-colors"
                >
                    <FaLinkedin className="w-6 h-6" />
                </a>
            </div>

            {/* Legal note */}
            <p className="opacity-60 text-xs">© 2025 Aaryan Kumar. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
