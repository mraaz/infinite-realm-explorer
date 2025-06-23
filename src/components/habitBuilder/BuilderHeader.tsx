import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BuilderHeaderProps {
  isEditing: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

const BuilderHeader = ({
  isEditing,
  onCancel,
  onDelete,
}: BuilderHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-8 relative">
      <div className="text-center flex-1">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          The Habit Architect
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
          Design a custom habit system tailored to your goals and lifestyle.
        </p>
      </div>

      <div className="absolute top-0 right-0 flex gap-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-2 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this habit? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex items-center gap-2 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default BuilderHeader;
