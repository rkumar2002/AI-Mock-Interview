'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAIModel';
import { LoaderCircle } from 'lucide-react';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid'; 
import { useUser } from '@clerk/nextjs';
import moment from 'moment';  
import { useRouter } from 'next/navigation';

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const inputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}, Based on this information, please generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in JSON format. Each question and answer should be structured as follows:
    {  
      "question": "Your question here",
      "answer": "Your answer here"
    }`;

    let responseText = '';

    try {
      const result = await chatSession.sendMessage(inputPrompt);
      responseText = await result.response.text();
      console.log('Raw response from AI:', responseText);  // Logging the raw response

      // Attempt to extract a valid JSON array from the response
      const jsonMatch = responseText.match(/\[.*?\]/s);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in the response');
      }

      // Parsing the JSON response safely
      const mockJsonResp = JSON.parse(jsonMatch[0].trim());
      setJsonResponse(mockJsonResp);

      const resp = await db
        .insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: JSON.stringify(mockJsonResp),
          jobPosition: jobPosition,
          jobDesc: jobDesc,
          jobExperience: jobExperience,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format('DD-MM-YYYY'),
        })
        .returning({ mockId: MockInterview.mockId });

      setLoading(false);
      router.push(`/dashboard/interview/${resp[0]?.mockId}`); 
    } catch (error) {
      console.error('Error fetching interview questions:', error);
      console.error('Response text:', responseText);  // Logging the problematic response for debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
        onClick={() => setOpenDialog(true)}
      >
        <h2 className='text-lg text-center'>+ Add New</h2>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='text-2xl'>Tell us more about your job interview</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <form onSubmit={onSubmit}>
              <div>
                <h2>Add details about your job position/role, Job description, and years of experience.</h2>
                <div className='mt-7 my-3'>
                  <label className='font-bold'>Job Role/Job Position</label>
                  <Input
                    placeholder='Ex. Full Stack Developer'
                    required
                    onChange={(event) => setJobPosition(event.target.value)}
                  />
                </div>
                <div className='my-3'>
                  <label className='font-bold'>Job Description / Tech Stack</label>
                  <Textarea
                    placeholder='Ex. React, Angular, NodeJs etc'
                    required
                    onChange={(event) => setJobDesc(event.target.value)}
                  />
                </div>
                <div className='my-3'>
                  <label className='font-bold'>Years Of Experience</label>
                  <Input
                    placeholder='Ex. 5'
                    type='number'
                    required
                    onChange={(event) => setJobExperience(event.target.value)}
                  />
                </div>
              </div>
              <div className='flex gap-5 justify-end'>
                <Button type='button' variant='ghost' onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type='submit' disabled={loading}>
                  {loading ? (
                    <>
                      <LoaderCircle className='animate-spin' /> Generating from AI
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
 