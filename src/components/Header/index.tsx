import { UserRound } from "lucide-react";
import Link from "next/link";
const Header = () => {
    return (
        <header className="w-full border-b border-gray-200">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link
                    href="/home"
                    className="text-2xl font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                    VoiceShare
                </Link>

                <Link href="/home" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <UserRound className="h-6 w-6 text-gray-600" />
                </Link>
            </div>
        </header>
    );
};
export default Header;