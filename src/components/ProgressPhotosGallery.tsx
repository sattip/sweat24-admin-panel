import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { progressPhotosApi } from "@/services/apiService";
import { Camera, Trash2, Calendar, Maximize2, X } from "lucide-react";

interface ProgressPhoto {
  id: number;
  imageUrl: string;
  date: string;
  caption: string | null;
}

interface ProgressPhotosGalleryProps {
  userId: string;
  userName: string;
  onPhotosCountChange?: (count: number) => void;
}

export function ProgressPhotosGallery({ userId, userName, onPhotosCountChange }: ProgressPhotosGalleryProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchPhotos();
    }
  }, [userId]);

  useEffect(() => {
    if (onPhotosCountChange) {
      onPhotosCountChange(photos.length);
    }
  }, [photos, onPhotosCountChange]);

  const fetchPhotos = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await progressPhotosApi.getUserPhotos(userId);
      setPhotos(response);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης φωτογραφιών προόδου.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!deletePhotoId) return;

    try {
      const response = await progressPhotosApi.deletePhoto(deletePhotoId);
      toast({
        title: "Επιτυχία",
        description: response.message || "Η φωτογραφία διαγράφηκε επιτυχώς.",
      });
      
      // Remove photo from state
      setPhotos(prev => prev.filter(p => p.id !== deletePhotoId));
      setDeletePhotoId(null);
      
      // Close preview if we're deleting the currently viewed photo
      if (selectedPhoto?.id === deletePhotoId) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία διαγραφής φωτογραφίας.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Φόρτωση φωτογραφιών...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Φωτογραφίες Προόδου - {userName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Δεν υπάρχουν φωτογραφίες προόδου
            </h3>
            <p className="text-muted-foreground">
              Ο πελάτης δεν έχει ανεβάσει ακόμα φωτογραφίες προόδου από την εφαρμογή.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Φωτογραφίες Προόδου - {userName}</CardTitle>
          <Badge variant="secondary">
            <Camera className="h-3 w-3 mr-1" />
            {photos.length} {photos.length === 1 ? 'φωτογραφία' : 'φωτογραφίες'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden border bg-card hover:shadow-lg transition-all duration-200"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-square">
                  <img
                    src={photo.imageUrl}
                    alt={`Progress photo ${photo.date}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Overlay with info on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <div className="flex items-center gap-1 text-xs mb-1">
                      <Calendar className="h-3 w-3" />
                      {photo.date}
                    </div>
                    {photo.caption && (
                      <p className="text-xs line-clamp-2">{photo.caption}</p>
                    )}
                  </div>
                </div>

                {/* Actions overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(photo);
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletePhotoId(photo.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full-size preview dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center justify-between">
              <span>Φωτογραφία Προόδου</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {selectedPhoto?.date}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
            {selectedPhoto?.caption && (
              <DialogDescription className="mt-2">
                {selectedPhoto.caption}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="px-6 pb-6">
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={selectedPhoto?.imageUrl}
                alt={`Progress photo ${selectedPhoto?.date}`}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedPhoto) {
                    setDeletePhotoId(selectedPhoto.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Διαγραφή Φωτογραφίας
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deletePhotoId} onOpenChange={() => setDeletePhotoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Διαγραφή Φωτογραφίας</AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη φωτογραφία προόδου; 
              Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoto}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}