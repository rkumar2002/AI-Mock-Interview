"use client";
import { Button } from "@/components/ui/button"; 
import React, { useContext, useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, WebcamIcon } from "lucide-react";
import { toast, Toaster } from "sonner";
import { chatSession } from "@/utils/GeminiAIModel";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { WebCamContext } from "@/app/dashboard/layout";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser(); 
  const [loading, setLoading] = useState(false);
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);

  useEffect(() => {
    results.map((result) =>
      setUserAnswer((prevAns) => prevAns + result?.transcript)
    );
  }, [results]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      updateUserAnswer();
    }
    // if (userAnswer?.length < 10) {
    //   setLoading(false);
    //   toast("Error while saving your answer, Please record again");
    //   return;
    // }
  }, [userAnswer]);

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const updateUserAnswer = async () => {
    try {
      console.log(userAnswer);
      setLoading(true);
      const feedbackPrompt =
        "Question:" +
        mockInterviewQuestion[activeQuestionIndex]?.question +
        ", User Answer:" +
        userAnswer +
        " , Depending on the question and user answer for given interview question" +
        " please give us a rating for the answer always out of 10 and feedback as area of improvement if any " +
        "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

      const result = await chatSession.sendMessage(feedbackPrompt);

      let MockJsonResp = result.response.text();
      console.log(MockJsonResp);

      // Removing possible extra text around JSON
      MockJsonResp = MockJsonResp.replace("```json", "").replace("```", "");

      // Attempt to parse JSON
      let jsonFeedbackResp;
      try {
        jsonFeedbackResp = JSON.parse(MockJsonResp);
        console.log(jsonFeedbackResp);  // Feedback in JSON format is created nicely here!

      } catch (e) {
        throw new Error("Invalid JSON response: " + MockJsonResp);
      }

      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: jsonFeedbackResp?.feedback,
        rating: jsonFeedbackResp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-YYYY"),
      });

      if (resp) {
        // console.log("Saved in db!");
        toast("User Answer recorded successfully"); 
      }
      setUserAnswer("");
      setResults([]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast("An error occurred while recording the user answer");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col justify-center items-center rounded-lg p-2 bg-secondary mt-4 w-[30rem] ">
        {webCamEnabled ? (
          <Webcam
            mirrored={true}
            style={{ height: "100%", width: "100%", zIndex: 1, borderRadius:"10px"}}
          />
        ) : (
        <div>
            <WebcamIcon className="h-72 w-full my-6 p-20" />
        </div>
        )}
      </div>
      <div className="md:flex  mt-4 md:mt-8 md:gap-5">
        <div className="my-4 md:my-0">
          <Button
            // className={`${webCamEnabled ? "w-full" : "w-full"}`}
            onClick={() => setWebCamEnabled((prev) => !prev)}
          >
            {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
          </Button>
        </div>
        <Button
          // className="my-10"
          onClick={StartStopRecording}
          disabled={loading}
        >
          {isRecording ? (
            <h2 className="text-red-300 flex gap-2 ">
              <Mic /> Stop Recording...
            </h2>
          ) : (
            "Record Answer"
          )}
        </Button>

      
      </div>
    </div>
  );
};

export default RecordAnswerSection;