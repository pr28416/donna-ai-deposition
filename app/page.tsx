"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Timestamp } from "@/lib/utils";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import ReactPlayer from "react-player";
// import dynamic from "next/dynamic";
// const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
import Image from "next/image";
import { getTimestamps, searchTimestamp } from "./actions";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [timestamps, setTimestamps] = useState<Timestamp[]>([
    // {
    //   start: 0,
    //   end: 13,
    //   utterance:
    //     "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed soluta est nesciunt perspiciatis fugit amet. Eum sunt autem, quo, minima vel et voluptatem maxime blanditiis, hic adipisci vitae. Quod, nam.",
    //   page: 3,
    // },
    // {
    //   start: 5222,
    //   end: 13,
    //   utterance:
    //     "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed soluta est nesciunt perspiciatis fugit amet. Eum sunt autem, quo, minima vel et voluptatem maxime blanditiis, hic adipisci vitae. Quod, nam.",
    //   page: 3,
    // },
    // {
    //   start: 0,
    //   end: 13,
    //   utterance:
    //     "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed soluta est nesciunt perspiciatis fugit amet. Eum sunt autem, quo, minima vel et voluptatem maxime blanditiis, hic adipisci vitae. Quod, nam.",
    //   page: 3,
    // },
    // {
    //   start: 0,
    //   end: 1223,
    //   utterance:
    //     "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed soluta est nesciunt perspiciatis fugit amet. Eum sunt autem, quo, minima vel et voluptatem maxime blanditiis, hic adipisci vitae. Quod, nam.",
    //   page: 3,
    // },
  ]);

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    const fetchData = async () => {
      await getTimestamps({
        video_path: "deposition.mp4",
        max_doc: 5,
        max_window: 3,
      }).then((data) => {
        setTimestamps(
          data.sort(
            (a: { start: number }, b: { start: number }) => a.start - b.start
          )
        );
      });
    };

    fetchData();
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const handleRowClick = (timestamp: Timestamp) => {
    console.log(timestamp);
    setPageNumber(timestamp.page);
    playerRef.current?.seekTo(timestamp.start);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const formattedSeconds = Math.floor(seconds).toString().padStart(2, "0");
    return `${minutes}:${formattedSeconds}`;
  };

  const handleSearch = async () => {
    setSearch("");
    setLoading(true);

    await searchTimestamp({
      text: search,
      top_k: 1,
      filter: {
        video_path: {
          $eq: "deposition.mp4",
        },
      },
    })
      .then((data) => {
        playerRef.current?.seekTo(data.time);
      })
      .finally(() => setLoading(false));
  };

  return (
    isClient && (
      <main className="flex min-h-screen flex-col items-center justify-between gap-4 bg-background text-foreground dark">
        <div className="flex flex-row gap-4 p-24">
          <div className="w-full flex flex-col gap-4">
            {/* <video src="video.mp4" className="rounded-lg border" controls ref={playerRef}/> */}
            <div className="rounded-lg border overflow-clip relative">
              <div
                className="absolute left-3 top-3 font-bold tracking-tight text-slate-200 text-2xl flex flex-row items-center gap-2"
                suppressHydrationWarning
              >
                <Image
                  height={24}
                  width={24}
                  src="/suitup.png"
                  alt="Logo"
                  className="rounded border"
                />
                Donna
              </div>
              <ReactPlayer
                url="video.mp4"
                controls
                width="100%"
                height="100%"
                ref={playerRef}
                suppressHydrationWarning
              />
            </div>
            <div className="flex flex-row items-center gap-2">
              <Input
                className="flex-1"
                placeholder="Search video"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleSearch}
                disabled={isLoading}
              >
                <Search size={20} />
              </Button>
            </div>
            <div className="border rounded-lg max-h-64 overflow-scroll">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="w-[120px]">Timestamp</TableHead>
                    <TableHead>Utterance</TableHead>
                    <TableHead className="text-right w-[140px]">
                      Page reference
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timestamps.map((timestamp, idx) => (
                    <TableRow
                      key={idx}
                      onClick={() => handleRowClick(timestamp)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        {formatTime(timestamp.start)} -{" "}
                        {formatTime(timestamp.end)}
                      </TableCell>
                      <TableCell>{timestamp.utterance}</TableCell>
                      <TableCell className="text-right">
                        {timestamp.page}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="w-[65rem] flex flex-col gap-2">
            <Document
              file="document.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              className="rounded-lg border"
            >
              <Page pageNumber={pageNumber} />
            </Document>
            <div className="flex flex-row items-center justify-center gap-2">
              <Button
                size="icon"
                variant="outline"
                disabled={pageNumber === 1}
                onClick={() => setPageNumber((p) => p - 1)}
              >
                <ArrowLeft size={20} />
              </Button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <Button
                size="icon"
                variant="outline"
                disabled={pageNumber === numPages}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                <ArrowRight size={20} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  );
}
