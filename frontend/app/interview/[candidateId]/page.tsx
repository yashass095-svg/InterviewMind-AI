"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Report = {
  overall_score: number;
  strengths: string[];
  improvements: string[];
};

type Message = {
  role: "ai" | "user";
  text: string;
};

type SpeechRecognitionEventLike = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();

  const candidateId =
    typeof params.candidateId === "string"
      ? params.candidateId
      : "CAND-001";

  const [sessionId, setSessionId] = useState("");
  const [question, setQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);

  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const [thinking, setThinking] = useState(false);

  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const totalQuestions = 8;

  /*
   * ---------------------------------------------------------
   * CAMERA
   * ---------------------------------------------------------
   */

  async function startCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraOn(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  function toggleCamera() {
    const stream = streamRef.current;

    if (!stream) {
      startCamera();
      setCameraOn(true);
      return;
    }

    const videoTracks = stream.getVideoTracks();

    videoTracks.forEach((track) => {
      track.enabled = !cameraOn;
    });

    setCameraOn(!cameraOn);
  }

  function toggleMic() {
    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    const audioTracks = stream.getAudioTracks();

    audioTracks.forEach((track) => {
      track.enabled = !micOn;
    });

    setMicOn(!micOn);
  }

  /*
   * ---------------------------------------------------------
   * START INTERVIEW
   * ---------------------------------------------------------
   */

  async function startInterview() {
    setStarting(true);
    setError("");

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/interview/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidate_id: candidateId,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();

        throw new Error(
          `Unable to start interview (${res.status}): ${text}`
        );
      }

      const data = await res.json();

      setSessionId(data.session_id);
      setQuestion(data.question);
      setQuestionNumber(data.question_number);

      setMessages([
        {
          role: "ai",
          text: "Welcome! I'm your AI interviewer. Let's begin with a technical question.",
        },
        {
          role: "ai",
          text: data.question,
        },
      ]);

      await startCamera();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to start interview."
      );
    } finally {
      setStarting(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------------
   */

  useEffect(() => {
    startInterview();

    return () => {
      stopCamera();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * TIMER
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (starting || completed) {
      return;
    }

    if (timeLeft <= 0) {
      finishInterview();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [starting, completed, timeLeft]);

  /*
   * ---------------------------------------------------------
   * FORMAT TIME
   * ---------------------------------------------------------
   */

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }

  /*
   * ---------------------------------------------------------
   * SPEECH RECOGNITION
   * ---------------------------------------------------------
   */

  function startListening() {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);

      alert(
        "Speech recognition is not supported in this browser. Please use Microsoft Edge or Google Chrome."
      );

      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onresult = (
        event: SpeechRecognitionEventLike
      ) => {
        let transcript = "";

        for (
          let i = 0;
          i < Object.keys(event.results).length;
          i++
        ) {
          const result = event.results[i];

          if (result && result[0]) {
            transcript += result[0].transcript;
          }
        }

        if (transcript.trim()) {
          setAnswer((previous) => {
            const cleaned = transcript.trim();

            if (!previous.trim()) {
              return cleaned;
            }

            return `${previous} ${cleaned}`;
          });
        }
      };

      recognition.onerror = (event) => {
        console.error(
          "Speech recognition error:",
          event.error
        );

        setListening(false);

        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          alert(
            "Microphone permission was denied. Please allow microphone access for localhost:3000."
          );
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;

      recognition.start();
      setListening(true);
    } catch (err) {
      console.error("Speech start error:", err);
      setListening(false);
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    setListening(false);
  }

  function toggleListening() {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  /*
   * ---------------------------------------------------------
   * SUBMIT ANSWER
   * ---------------------------------------------------------
   */

  async function submitAnswer() {
    if (!sessionId) {
      setError("Interview session is not ready.");
      return;
    }

    if (!answer.trim()) {
      alert("Please enter or speak your answer first.");
      return;
    }

    stopListening();

    setLoading(true);
    setThinking(true);
    setError("");

    const currentAnswer = answer.trim();

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: currentAnswer,
      },
    ]);

    setAnswer("");

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/interview/answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            answer: currentAnswer,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();

        throw new Error(
          `Failed to submit answer (${res.status}): ${text}`
        );
      }

      const data = await res.json();

      if (data.done) {
        setQuestion(data.question);
        setQuestionNumber(data.question_number);

        setMessages((previous) => [
          ...previous,
          {
            role: "ai",
            text: "Excellent. You have completed all interview questions. I'm preparing your performance report now.",
          },
        ]);

        await finishInterview();
      } else {
        setQuestion(data.question);
        setQuestionNumber(data.question_number);

        setMessages((previous) => [
          ...previous,
          {
            role: "ai",
            text: data.question,
          },
        ]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Error submitting answer."
      );

      setMessages((previous) => previous.slice(0, -1));

      setAnswer(currentAnswer);
    } finally {
      setLoading(false);
      setThinking(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * FINISH INTERVIEW
   * ---------------------------------------------------------
   */

  async function finishInterview() {
    if (!sessionId) {
      return;
    }

    stopListening();
    stopCamera();

    try {
      await fetch(
        "http://127.0.0.1:8000/api/interview/finish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
          }),
        }
      );
    } catch (err) {
      console.error("Finish error:", err);
    }

    try {
      const reportResponse = await fetch(
        "http://127.0.0.1:8000/api/interview/report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
          }),
        }
      );

      if (!reportResponse.ok) {
        throw new Error("Unable to generate report.");
      }

      const reportData = await reportResponse.json();

      setReport(reportData);
    } catch (err) {
      console.error("Report error:", err);

      setReport({
        overall_score: 0,
        strengths: [
          "Interview completed successfully.",
        ],
        improvements: [
          "Unable to retrieve the AI evaluation report.",
        ],
      });
    }

    setCompleted(true);
  }

  /*
   * ---------------------------------------------------------
   * PROGRESS
   * ---------------------------------------------------------
   */

  const progress = Math.min(
    100,
    Math.round(
      ((questionNumber - 1) / totalQuestions) * 100
    )
  );

  /*
   * ---------------------------------------------------------
   * STARTING SCREEN
   * ---------------------------------------------------------
   */

  if (starting) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-blue-500/20 bg-[#0b1025] p-10 text-center shadow-2xl shadow-blue-900/20">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600/20 text-4xl">
            AI
          </div>

          <h1 className="text-4xl font-bold">
            InterviewMind AI
          </h1>

          <p className="mt-3 text-slate-400">
            Preparing your AI-powered technical interview...
          </p>

          <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Initializing interviewer | Camera | Voice | AI evaluation
          </p>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR SCREEN
   * ---------------------------------------------------------
   */

  if (error && !sessionId) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-red-500/20 bg-[#0b1025] p-10 text-center">
          <div className="text-5xl font-black text-red-300">!</div>

          <h1 className="mt-5 text-3xl font-bold">
            Unable to Start Interview
          </h1>

          <p className="mt-4 text-red-300">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-8 rounded-xl bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * COMPLETED REPORT
   * ---------------------------------------------------------
   */

  if (completed && report) {
    return (
      <main className="min-h-screen bg-[#050816] text-white px-5 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/10 text-4xl">
              OK
            </div>

            <h1 className="mt-5 text-4xl font-bold">
              Interview Completed
            </h1>

            <p className="mt-2 text-slate-400">
              Here is your AI-powered performance analysis.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-blue-500/20 bg-[#0b1025] p-7 md:col-span-1">
              <p className="text-sm uppercase tracking-widest text-slate-500">
                Overall Score
              </p>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-7xl font-black text-blue-400">
                  {report.overall_score}
                </span>

                <span className="mb-3 text-slate-500">
                  /100
                </span>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, report.overall_score)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-green-500/20 bg-[#0b1025] p-7 md:col-span-2">
              <h2 className="text-2xl font-bold">
                Strengths
              </h2>

              <div className="mt-5 space-y-3">
                {report.strengths.length > 0 ? (
                  report.strengths.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-green-500/10 p-4 text-green-100"
                    >
                      Passed: {item}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">
                    No strengths were returned.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-orange-500/20 bg-[#0b1025] p-7 md:col-span-3">
              <h2 className="text-2xl font-bold">
                Areas to Improve
              </h2>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {report.improvements.length > 0 ? (
                  report.improvements.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-orange-500/10 p-4 text-orange-100"
                    >
                      Next: {item}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">
                    No improvements were returned.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            >
              Start New Interview
            </button>

            <button
              onClick={() => router.push("/")}
              className="rounded-xl border border-slate-700 bg-slate-900 px-8 py-4 font-bold transition hover:bg-slate-800"
            >
              Back Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN INTERVIEW UI
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#070b19]/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-xl">
              AI
            </div>

            <div>
              <h1 className="font-bold">
                InterviewMind AI
              </h1>

              <p className="text-xs text-slate-500">
                AI Technical Interviewer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl border px-4 py-2 font-mono font-bold ${
                timeLeft <= 120
                  ? "border-red-500/40 bg-red-500/10 text-red-400"
                  : "border-blue-500/20 bg-blue-500/10 text-blue-300"
              }`}
            >
              Time {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-[1500px] lg:grid-cols-[320px_1fr]">
        {/* LEFT SIDEBAR */}

        <aside className="border-r border-white/10 bg-[#070b19] p-5">
          {/* CAMERA */}

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
            <div className="relative aspect-video">
              {cameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-900 text-5xl">
                  OFF
                </div>
              )}

              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs backdrop-blur">
                <span
                  className={`h-2 w-2 rounded-full ${
                    cameraOn
                      ? "bg-green-400"
                      : "bg-red-400"
                  }`}
                />
                {cameraOn ? "Camera On" : "Camera Off"}
              </div>
            </div>

            <div className="flex justify-center gap-3 border-t border-white/10 bg-[#0b1020] p-3">
              <button
                onClick={toggleMic}
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  micOn
                    ? "bg-blue-600"
                    : "bg-red-600"
                }`}
              >
                {micOn ? "Mic" : "Muted"}
              </button>

              <button
                onClick={toggleCamera}
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  cameraOn
                    ? "bg-blue-600"
                    : "bg-red-600"
                }`}
              >
                {cameraOn ? "Cam" : "Off"}
              </button>
            </div>
          </div>

          {/* TIMER CARD */}

          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b1025] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Time Remaining
              </span>

              <span className="text-blue-400">
                Live
              </span>
            </div>

            <div
              className={`mt-2 text-3xl font-black ${
                timeLeft <= 120
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* PROGRESS */}

          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b1025] p-5">
            <div className="flex justify-between">
              <span className="text-sm font-semibold">
                PROGRESS
              </span>

              <span className="text-sm text-slate-400">
                {questionNumber}/{totalQuestions}
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                style={{
                  width: `${Math.max(
                    8,
                    progress
                  )}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {progress}% interview completed
            </p>
          </div>

          {/* AI STATUS */}

          <div className="mt-5 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-5">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20">
                AI
              </div>

              <div>
                <p className="font-semibold">
                  AI Interviewer
                </p>

                <p className="text-xs text-green-400">
                  Online
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              Your responses are being evaluated for
              technical knowledge, clarity and practical
              understanding.
            </p>
          </div>
        </aside>

        {/* CHAT AREA */}

        <section className="flex min-h-[calc(100vh-73px)] flex-col bg-[#030712]">
          {/* TOP INFO */}

          <div className="border-b border-white/10 px-6 py-5">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
                  Technical Interview
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Question {questionNumber}
                  <span className="ml-2 text-slate-600">
                    / {totalQuestions}
                  </span>
                </h2>
              </div>

              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400 sm:block">
                Adaptive AI Evaluation
              </div>
            </div>
          </div>

          {/* MESSAGES */}

          <div className="flex-1 overflow-y-auto px-5 py-7">
            <div className="mx-auto max-w-4xl space-y-5">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[85%] gap-3 ${
                      message.role === "user"
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        message.role === "user"
                          ? "bg-blue-600"
                          : "bg-blue-500/10"
                      }`}
                    >
                      {message.role === "user"
                        ? "You"
                        : "AI"}
                    </div>

                    <div
                      className={`rounded-2xl px-5 py-4 leading-7 ${
                        message.role === "user"
                          ? "rounded-tr-sm bg-blue-600 text-white"
                          : "rounded-tl-sm border border-white/10 bg-[#0d1428] text-slate-200"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* AI THINKING */}

              {thinking && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                    AI
                  </div>

                  <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-[#0d1428] px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>AI is thinking</span>

                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* INPUT AREA */}

          <div className="border-t border-white/10 bg-[#050918] p-5">
            <div className="mx-auto max-w-4xl">
              {/* SPEECH STATUS */}

              {listening && (
                <div className="mb-3 flex items-center gap-2 text-sm text-red-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  Listening... speak your answer
                </div>
              )}

              {/* INPUT */}

              <div
                className={`relative rounded-2xl border bg-[#0b1025] transition ${
                  listening
                    ? "border-red-500/60 shadow-lg shadow-red-900/10"
                    : "border-blue-500/20"
                }`}
              >
                <textarea
                  value={answer}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      if (!loading) {
                        submitAnswer();
                      }
                    }
                  }}
                  disabled={loading}
                  placeholder={
                    listening
                      ? "Listening to your answer..."
                      : "Type your answer... (Press Enter to send)"
                  }
                  className="min-h-[110px] w-full resize-none bg-transparent p-5 pr-28 text-white outline-none placeholder:text-slate-600"
                />

                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={loading}
                    title={
                      speechSupported
                        ? "Voice answer"
                        : "Speech recognition unavailable"
                    }
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                      listening
                        ? "bg-red-600 text-white"
                        : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                    }`}
                  >
                    {listening ? "Stop" : "Voice"}
                  </button>

                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={
                      loading || !answer.trim()
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* BOTTOM INFO */}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>
                  Voice input supported
                </span>

                <span>
                  Shift + Enter for a new line
                </span>

                <span>
                  Your answers are AI evaluated
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
