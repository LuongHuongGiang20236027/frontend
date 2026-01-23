"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function AssignmentDetail({
  questions,
  currentQuestion,
  userAnswers,
  onAnswerChange,
  onNext,
  onPrevious,
  onSubmit,
  answeredCount,
  isSubmitting
}) {
  const question = questions[currentQuestion]
  const isMultiple = question.question_type === "multiple"
  const userAnswer = userAnswers[question.id] || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {question.question_text}
        </CardTitle>
        <CardDescription>
          {isMultiple
            ? "Chọn tất cả đáp án đúng"
            : "Chọn một đáp án"}{" "}
          • {question.score} điểm
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isMultiple ? (
          <div className="space-y-3">
            {question.options.map(option => (
              <div
                key={option.id}
                className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <Checkbox
                  id={`option-${option.id}`}
                  checked={userAnswer.includes(option.id)}
                  onCheckedChange={() =>
                    onAnswerChange(question.id, option.id, true)
                  }
                />
                <Label
                  htmlFor={`option-${option.id}`}
                  className="flex-1 cursor-pointer"
                >
                  {option.option_text}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup
            value={userAnswer[0]?.toString()}
            onValueChange={val =>
              onAnswerChange(question.id, Number(val), false)
            }
          >
            <div className="space-y-3">
              {question.options.map(option => (
                <div
                  key={option.id}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50"
                >
                  <RadioGroupItem
                    value={option.id.toString()}
                    id={`option-${option.id}`}
                  />
                  <Label
                    htmlFor={`option-${option.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option.option_text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}
      </CardContent>

      <CardFooter className="flex justify-end">
        {currentQuestion === questions.length - 1 ? (
          <Button
            onClick={onSubmit}
            disabled={
              answeredCount !== questions.length || isSubmitting
            }
          >
            Nộp bài
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentQuestion === 0}
            >
              Câu trước
            </Button>
            <Button onClick={onNext}>Câu tiếp</Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
