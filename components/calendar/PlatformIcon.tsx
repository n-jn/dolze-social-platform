import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

interface PlatformIconProps {
  platform: string;
  className?: string;
}

export default function PlatformIcon({ platform, className }: PlatformIconProps) {
  switch (platform) {
    case "Twitter":
      return <FaTwitter className={className} />;
    case "Instagram":
      return <FaInstagram className={className} />;
    case "LinkedIn":
      return <FaLinkedin className={className} />;
    default:
      return null;
  }
}
