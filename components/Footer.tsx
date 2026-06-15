"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";

const quickLinks = [
  { label: "Home", href: "/", internal: true },
  { label: "Blog", href: "https://ratemytone.com/blog/" },
];

const informationLinks = [
  { label: "Privacy Policy", href: "https://ratemytone.com/privacy-policy/" },
  { label: "Terms & Conditions", href: "https://ratemytone.com/terms-conditions/" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Rate-My-Tone/61572228594245/?mibextid=wwXIfr",
    Icon: FaFacebookF,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ratemytone/#",
    Icon: FaInstagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@ratemytone.com",
    Icon: FaTiktok,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@ratemytone",
    Icon: FaYoutube,
  },
];

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-5 text-[16px] font-bold uppercase tracking-[3px] text-white">
      {children}
    </h2>
  );
}

function FooterLink({
  href,
  children,
  internal,
}: {
  href: string;
  children: ReactNode;
  internal?: boolean;
}) {
  const className =
    "inline-flex py-1 text-[15px] font-normal text-white transition-colors duration-300 hover:text-[#53A872]";

  if (internal) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export default function Footer() {
  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <footer className="w-full border-0 border-t-[5px] border-t-[#fafafa] bg-[#141414] px-[10px] py-[60px] text-white">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 md:grid-cols-[1.05fr_0.45fr_0.85fr_0.95fr_1.15fr] md:gap-6">
        <div>
          <img
            src="https://ratemytone.com/wp-content/uploads/2024/09/RMT-Logo-lg-1024x1014.png"
            alt="Rate My Tone"
            className="mb-4 h-auto w-[100px]"
          />
          <p
            className="text-[32px] font-normal leading-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            RATE MY TONE
          </p>
        </div>

        <div className="hidden md:block" />

        <nav aria-label="Footer quick links">
          <FooterHeading>Quick Links</FooterHeading>
          <div className="flex flex-col items-start">
            {quickLinks.map((link) => (
              <FooterLink key={link.label} href={link.href} internal={link.internal}>
                {link.label}
              </FooterLink>
            ))}
          </div>
        </nav>

        <nav aria-label="Footer information links">
          <FooterHeading>Information</FooterHeading>
          <div className="flex flex-col items-start">
            {informationLinks.map((link) => (
              <FooterLink key={link.label} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
            <a
              href="https://www.paypal.com/donate/?hosted_button_id=V4B2LGNFLFNKL"
              className="mt-4 inline-flex rounded-[25px] border border-white px-[30px] py-[10px] text-[15px] font-medium text-white transition-colors duration-300 hover:border-[#D9F90B] hover:bg-[#E8E312] hover:text-black"
              target="_blank"
              rel="noreferrer"
            >
              Support Us
            </a>
          </div>
        </nav>

        <div>
          <FooterHeading>Get In Touch</FooterHeading>
          <FooterLink href="https://ratemytone.com/contact/">Contact Us</FooterLink>

          <div className="mt-5 flex flex-wrap gap-[5px]">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-12 w-12 items-center justify-center rounded-[10px] border-[3px] border-white text-white transition-colors duration-300 hover:border-[#53A872] hover:bg-[#53A872]"
                target="_blank"
                rel="noreferrer"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>

          <form
            className="mt-7 flex w-full max-w-[360px] overflow-hidden rounded-[25px] bg-white"
            onSubmit={handleNewsletterSubmit}
          >
            <label className="sr-only" htmlFor="footer-newsletter-email">
              Newsletter Signup
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              placeholder="Newsletter Signup"
              className="min-w-0 flex-1 bg-white px-5 py-3 text-[14px] text-[#333] outline-none placeholder:text-[#7a7a7a]"
            />
            <button
              type="submit"
              className="w-[30%] min-w-[82px] bg-[#42b27c] px-4 py-3 text-[14px] font-medium text-white transition-colors duration-300 hover:bg-[#53A872]"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
