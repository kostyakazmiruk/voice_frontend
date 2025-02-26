"use client"
import Header from "@/components/Header/index";
import Recordings from "../components/RecordingsList";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import AudioRecorder from "@/components/AudioRecorder";

export default function Home() {
  return (
      <>
            <Header />

            <main className="min-h-[100vh] grid place-items-center ">
              <AudioRecorder />
            </main>
      </>
  );
}
