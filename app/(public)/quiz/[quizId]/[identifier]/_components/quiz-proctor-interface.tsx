"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertTriangle, Eye, EyeOff, User as UserIcon, Mail, Phone, IdCard, Building2, BookOpen, Award, Timer, CheckCircle2 } from "lucide-react";
import { submitQuizAttempt } from "../actions";

interface Quiz {
  id: string;
  quizId: string;
  title: string;
  description: string;
  sets: number;
  duration: number;
  pointsPerQuestion: number;
  questionsJson: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  registration?: string | null;
  username?: string | null;
  mobile?: string | null;
  branch?: string | null;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProctorInterfaceProps {
  quiz: Quiz;
  user: User;
  hasExistingAttempt: boolean;
  assignedSet: string;
}

type QuizStep = 'user-info' | 'quiz-details' | 'quiz-started' | 'quiz-submitted';

export default function QuizProctorInterface({ 
  quiz, 
  user, 
  hasExistingAttempt,
  assignedSet
}: QuizProctorInterfaceProps) {
  const [currentStep, setCurrentStep] = useState<QuizStep>('user-info');
  const [selectedSet] = useState<string>(assignedSet); // Pre-selected with assigned set
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration * 60); // Convert minutes to seconds
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    pointsEarned: number;
    tabSwitches: number;
    detailedResults?: Array<{
      questionIndex: number;
      question: string;
      userAnswer: number;
      correctAnswer: number;
      isCorrect: boolean;
      options: string[];
    }>;
  } | null>(null);

  // Parse questions to get set information
  const questionsData = JSON.parse(quiz.questionsJson);
  const availableSets = Object.keys(questionsData);
  const getQuestionCount = (set: string) => {
    return Array.isArray(questionsData[set]) ? questionsData[set].length : 0;
  };

  // Load questions for the assigned set when quiz starts
  useEffect(() => {
    if (currentStep === 'quiz-started' && selectedSet) {
      const questionsForSet = questionsData[selectedSet];
      if (Array.isArray(questionsForSet)) {
        setQuestions(questionsForSet as Question[]);
      }
    }
  }, [currentStep, selectedSet]);

  // Timer countdown
  useEffect(() => {
    if (currentStep !== 'quiz-started') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        // Show warning when 5 minutes remaining
        if (prev === 300) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if time is running low (less than 5 minutes)
  const isTimeLow = timeRemaining <= 300 && timeRemaining > 0;

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting || Object.keys(answers).length !== questions.length) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await submitQuizAttempt({
        quizId: quiz.quizId,
        quizDbId: quiz.id,
        assignedSet: selectedSet,
        answers,
        tabSwitches,
        questionsJson: quiz.questionsJson,
      });

      if (result.status === "success" && result.data) {
        setSubmissionResult(result.data);
        setCurrentStep('quiz-submitted');
        // Exit fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      } else {
        alert(result.message || "Failed to submit quiz. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("An error occurred while submitting the quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Prevent tab switching and detect visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentStep === 'quiz-started' && !isBlocked) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          
          if (newCount >= 3) {
            // Third strike - block the quiz
            setIsBlocked(true);
            setShowWarning(true);
          } else {
            // First and second warning
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);
          }
          
          return newCount;
        });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep === 'quiz-started') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // Prevent right-click
    const handleContextMenu = (e: MouseEvent) => {
      if (currentStep === 'quiz-started') {
        e.preventDefault();
      }
    };

    // Prevent certain keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep === 'quiz-started') {
        // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'u')
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep, isBlocked]);

  // Request fullscreen
  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }
  };

  // Exit fullscreen
  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
    }
  };

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      if (!document.fullscreenElement && currentStep === 'quiz-started' && !isBlocked) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          
          if (newCount >= 3) {
            // Third strike - block the quiz
            setIsBlocked(true);
            setShowWarning(true);
          } else {
            // First and second warning
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);
          }
          
          return newCount;
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [currentStep, isBlocked]);

  const handleStartQuiz = () => {
    enterFullscreen();
    setCurrentStep('quiz-started');
  };

  // Step 1: User Information
  if (currentStep === 'user-info') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-muted">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Verify Your Information</CardTitle>
            <CardDescription>Please confirm your details before proceeding to the quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <UserIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {user.mobile && (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Mobile Number</p>
                    <p className="font-medium">{user.mobile}</p>
                  </div>
                </div>
              )}

              {user.registration && (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <IdCard className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Registration Number</p>
                    <p className="font-medium">{user.registration}</p>
                  </div>
                </div>
              )}

              {user.branch && (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Branch</p>
                    <p className="font-medium">{user.branch}</p>
                  </div>
                </div>
              )}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                If any of the above information is incorrect, please contact your administrator before proceeding.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => setCurrentStep('quiz-details')}
              className="w-full text-lg py-6 cursor-pointer bg-primary hover:bg-primary/90 text-white"
              size="lg"
            >
              Continue to Quiz Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Quiz Details and Set Selection
  if (currentStep === 'quiz-details') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-muted">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold">{quiz.duration} minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Award className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Points per Question</p>
                  <p className="font-semibold">{quiz.pointsPerQuestion} points</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <BookOpen className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Available Sets</p>
                  <p className="font-semibold">{availableSets.length} set{availableSets.length > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <IdCard className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  {hasExistingAttempt ? (
                    <Badge variant="secondary">Retaking Quiz</Badge>
                  ) : (
                    <Badge variant="default">First Attempt</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Set Selection - Display Only (Pre-assigned) */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Your Assigned Set</label>
              <div className="p-6 border-2 border-primary bg-primary/10 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">Set {selectedSet}</div>
                  <p className="text-sm text-muted-foreground">
                    This set has been randomly assigned to you
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {getQuestionCount(selectedSet)} question{getQuestionCount(selectedSet) !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm">
                  <strong>Total Points:</strong> {getQuestionCount(selectedSet)} questions × {quiz.pointsPerQuestion} points = <strong>{getQuestionCount(selectedSet) * quiz.pointsPerQuestion} points</strong>
                </p>
              </div>
            </div>

            {/* Instructions */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important Instructions:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>The quiz will open in fullscreen mode</li>
                  <li>Do not switch tabs or exit fullscreen during the quiz</li>
                  <li>Any suspicious activity will be recorded</li>
                  <li>You cannot pause the quiz once started</li>
                  <li>Make sure you have a stable internet connection</li>
                  <li>Your set has been randomly assigned by the system</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => setCurrentStep('user-info')}
                variant="outline"
                className="flex-1 cursor-pointer"
                size="lg"
              >
                Back
              </Button>
              <Button 
                onClick={handleStartQuiz}
                className="flex-1 bg-green-600 cursor-pointer hover:bg-green-700 text-white text-lg py-6"
                size="lg"
              >
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Quiz Submitted - Thank You Page
  if (currentStep === 'quiz-submitted' && submissionResult) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted p-4 py-8">
        <div className="container mx-auto max-w-4xl space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
              <CardDescription className="text-base mt-2">
                Your answers have been submitted and evaluated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Summary */}
              <div className="p-6 bg-muted rounded-lg">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Your Results</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-3xl font-bold text-primary">{submissionResult.score}%</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Correct</p>
                    <p className="text-3xl font-bold text-green-600">{submissionResult.correctAnswers}</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold">{submissionResult.totalQuestions}</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Points</p>
                    <p className="text-3xl font-bold text-primary">{submissionResult.pointsEarned}</p>
                  </div>
                </div>

                {submissionResult.tabSwitches > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Note:</strong> {submissionResult.tabSwitches} violation{submissionResult.tabSwitches !== 1 ? 's' : ''} detected during the quiz.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Quiz Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Quiz:</span>
                  <span className="font-medium">{quiz.title}</span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Set:</span>
                  <span className="font-medium">Set {selectedSet}</span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Participant:</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          {submissionResult.detailedResults && submissionResult.detailedResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Answer Review</CardTitle>
                <CardDescription>
                  Review your answers and see the correct solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissionResult.detailedResults.map((result, index) => (
                    <div 
                      key={result.questionIndex} 
                      className={`p-4 rounded-lg border-2 ${
                        result.isCorrect 
                          ? 'border-green-600 bg-green-600/5' 
                          : 'border-red-600 bg-red-600/5'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          result.isCorrect 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {result.isCorrect ? '✓' : '✗'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Question {result.questionIndex + 1}</h4>
                            <Badge variant={result.isCorrect ? "default" : "destructive"}>
                              {result.isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                          <p className="text-sm mb-3">{result.question}</p>
                          
                          <div className="space-y-2">
                            {result.options.map((option, oIndex) => {
                              const isUserAnswer = result.userAnswer === oIndex;
                              const isCorrectAnswer = result.correctAnswer === oIndex;
                              
                              return (
                                <div 
                                  key={oIndex}
                                  className={`p-3 rounded-lg border text-sm ${
                                    isCorrectAnswer
                                      ? 'border-green-600 bg-green-600/10'
                                      : isUserAnswer && !result.isCorrect
                                      ? 'border-red-600 bg-red-600/10'
                                      : 'border-muted bg-background'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{String.fromCharCode(65 + oIndex)}.</span>
                                    <span className="flex-1">{option}</span>
                                    {isCorrectAnswer && (
                                      <Badge variant="outline" className="border-green-600 text-green-600 text-xs">
                                        Correct Answer
                                      </Badge>
                                    )}
                                    {isUserAnswer && !result.isCorrect && (
                                      <Badge variant="outline" className="border-red-600 text-red-600 text-xs">
                                        Your Answer
                                      </Badge>
                                    )}
                                    {isUserAnswer && result.isCorrect && (
                                      <Badge variant="outline" className="border-green-600 text-green-600 text-xs">
                                        Your Answer
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {!result.isCorrect && (
                            <div className="mt-3 p-2 bg-muted rounded text-xs">
                              <span className="text-muted-foreground">
                                You selected: <strong>{String.fromCharCode(65 + result.userAnswer)}</strong> | 
                                Correct answer: <strong>{String.fromCharCode(65 + result.correctAnswer)}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => window.close()}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Close Window
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard/achievements'}
                  className="flex-1"
                  size="lg"
                >
                  View Achievements
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Quiz Started
  return (
    <div className="min-h-screen bg-background">
      {/* Blocked Screen Overlay */}
      {isBlocked && (
        <div className="fixed inset-0 bg-black/90 z-100 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-destructive">
            <CardHeader>
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-8 w-8" />
                <CardTitle className="text-2xl">Quiz Blocked</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-base">
                  Your quiz has been blocked due to multiple violations of exam rules.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <p className="font-semibold">Violations Detected:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Tab switching: {tabSwitches} time{tabSwitches !== 1 ? 's' : ''}</li>
                  <li>You were warned {tabSwitches - 1} time{tabSwitches - 1 !== 1 ? 's' : ''} before blocking</li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>What happens now?</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your quiz attempt has been terminated and the violations have been recorded. 
                  Please contact your instructor or administrator for further instructions.
                </p>
              </div>

              <div className="text-center pt-4">
                <Button 
                  onClick={() => window.close()}
                  variant="destructive"
                  size="lg"
                >
                  Close Quiz Window
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Warning Banner */}
      {showWarning && !isBlocked && (
        <Alert variant="destructive" className="fixed top-4 left-1/2 -translate-x-1/2 w-auto max-w-md z-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {tabSwitches === 1 && 'Warning 1/3: Tab switch detected! Two more violations will block the quiz.'}
            {tabSwitches === 2 && 'Warning 2/3: Second violation! One more and the quiz will be blocked.'}
            {timeRemaining === 300 && tabSwitches === 0 && '5 minutes remaining! Please complete your quiz.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Quiz Header */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold">{quiz.title}</h1>
              <p className="text-sm text-muted-foreground">{user.name} - Set {selectedSet}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                isTimeLow ? 'border-destructive bg-destructive/10' : 'border-primary bg-primary/10'
              }`}>
                <Timer className={`h-5 w-5 ${isTimeLow ? 'text-destructive' : 'text-primary'}`} />
                <span className={`text-lg font-bold ${isTimeLow ? 'text-destructive' : 'text-primary'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {tabSwitches > 0 && (
                <Badge 
                  variant="destructive" 
                  className="flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {tabSwitches === 1 && 'Warning 1/3'}
                  {tabSwitches === 2 && 'Warning 2/3'}
                  {tabSwitches >= 3 && 'BLOCKED'}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              >
                {isFullscreen ? (
                  <><EyeOff className="h-4 w-4 mr-2" />Exit Fullscreen</>
                ) : (
                  <><Eye className="h-4 w-4 mr-2" />Enter Fullscreen</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Loading Questions...</h2>
                <p className="text-muted-foreground">
                  Please wait while we load your quiz questions.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Question Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Progress Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Question: </span>
                        <span className="font-semibold">{currentQuestionIndex + 1} of {questions.length}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Answered: </span>
                        <span className="font-semibold">{Object.keys(answers).length}/{questions.length}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Points per Question: </span>
                        <span className="font-semibold">{quiz.pointsPerQuestion}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Question */}
              {currentQuestion && (
                <Card className={answers[currentQuestionIndex] !== undefined ? 'border-primary' : ''}>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Question {currentQuestionIndex + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
                    
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, oIndex) => (
                        <button
                          key={oIndex}
                          onClick={() => handleAnswerSelect(currentQuestionIndex, oIndex)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            answers[currentQuestionIndex] === oIndex
                              ? 'border-primary bg-primary/10'
                              : 'border-muted hover:border-muted-foreground/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              answers[currentQuestionIndex] === oIndex
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground'
                            }`}>
                              {answers[currentQuestionIndex] === oIndex && (
                                <div className="w-3 h-3 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="flex-1">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {answers[currentQuestionIndex] !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          Answered
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      size="lg"
                    >
                      ← Previous
                    </Button>
                    
                    <div className="text-sm text-muted-foreground">
                      {currentQuestionIndex + 1} / {questions.length}
                    </div>

                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(answers).length !== questions.length || isSubmitting}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        size="lg"
                      >
                        Next →
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Question Navigator */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-base">Questions</CardTitle>
                  <CardDescription className="text-xs">
                    Click to jump to question
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleJumpToQuestion(index)}
                        className={`
                          aspect-square rounded-lg border-2 font-semibold text-sm transition-all
                          ${currentQuestionIndex === index
                            ? 'border-primary bg-primary text-primary-foreground'
                            : answers[index] !== undefined
                            ? 'border-green-600 bg-green-600/10 text-green-600'
                            : 'border-muted hover:border-muted-foreground/50'
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded border-2 border-primary bg-primary"></div>
                      <span className="text-muted-foreground">Current</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded border-2 border-green-600 bg-green-600/10"></div>
                      <span className="text-muted-foreground">Answered</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded border-2 border-muted"></div>
                      <span className="text-muted-foreground">Unanswered</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(answers).length !== questions.length || isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                    {Object.keys(answers).length !== questions.length && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        {questions.length - Object.keys(answers).length} remaining
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
