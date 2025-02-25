"use client"
import Header from "@/components/Header";
import RecordingsList from "../../components/RecordingsList";

const Page = () => {
    return (
        <div className="min-h-screen bg-white">
            <Header/>

            <main className="container mx-auto px-4 py-8">
                <RecordingsList />
            </main>
        </div>
    );
};

export default Page;