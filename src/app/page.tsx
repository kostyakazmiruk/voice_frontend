"use client"
import Header from "@/components/Header/index";
import Recordings from "../components/RecordingsList";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import AudioRecorder from "@/components/AudioRecorder";

export default function Home() {
  return (
      <div>
            <Header />

            <main className="container mx-auto px-4 py-8">
              <AudioRecorder />
            </main>
      </div>
  );
}
