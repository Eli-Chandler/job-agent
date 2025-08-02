import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import {
  GlobeIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  SaveIcon,
  XIcon,
  ExternalLinkIcon,
  LoaderIcon
} from 'lucide-react';
import type { CandidateSocialLinkDTO, AddOrUpdateSocialRequest } from '@/api/models';
import {useState} from "react";
import {Link} from "react-router";
import {useDeleteSocialLink, useGetSocialLinks, useUpdateSocialLink} from "@/api/me/me.ts";

export default function SocialLinks() {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // API hooks
  const { data, isLoading, refetch } = useGetSocialLinks();
  const addSocialMutation = useUpdateSocialLink();
  const deleteSocialMutation = useDeleteSocialLink();

  const socials = data?.data || []

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setIsEditing(true);
  };

  const handleSaveSocial = async (socialId: number | null, name: string, link: string) => {
    const request: AddOrUpdateSocialRequest = { name, link };

    try {
      await addSocialMutation.mutateAsync({ data: request });
      await refetch();
      if (socialId === null) {
        setIsAddingNew(false);
      }
    } catch (error) {
      console.error('Failed to save social link:', error);
    }
  };

  const handleDeleteSocial = async (socialId: number) => {
    try {
      await deleteSocialMutation.mutateAsync({ socialId });
      await refetch();
    } catch (error) {
      console.error('Failed to delete social link:', error);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    if (socials.length === 0) {
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoaderIcon className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading social links...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GlobeIcon className="h-5 w-5" />
            Social Links
          </div>
          {!isEditing && socials.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleToggleEdit}>
              <EditIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {socials.length === 0 && !isAddingNew ? (
          <div className="text-center py-8 text-muted-foreground">
            <GlobeIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No social links added yet</p>
          </div>
        ) : (
          socials.map((social) => (
            <SocialLink
              key={social.id}
              socialLink={social}
              isEditing={isEditing}
              onSave={(name, link) => handleSaveSocial(social.id, name, link)}
              onDelete={() => handleDeleteSocial(social.id)}
              isLoading={addSocialMutation.isPending || deleteSocialMutation.isPending}
            />
          ))
        )}

        {isAddingNew && (
          <NewSocialLink
            onSave={(name, link) => handleSaveSocial(null, name, link)}
            onCancel={handleCancelAdd}
            isLoading={addSocialMutation.isPending}
          />
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleToggleEdit}>
              Done
            </Button>
            <Button variant="outline" onClick={handleAddNew} disabled={isAddingNew}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Social Link
            </Button>
          </>
        ) : (
          socials.length === 0 && (
            <Button onClick={handleAddNew}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Social Link
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}

interface SocialLinkProps {
  socialLink: CandidateSocialLinkDTO;
  onSave: (name: string, link: string) => void;
  onDelete: () => void;
  isEditing: boolean;
  isLoading: boolean;
}

function SocialLink({ socialLink, onSave, onDelete, isEditing, isLoading }: SocialLinkProps) {
  const [name, setName] = useState(socialLink.name);
  const [link, setLink] = useState(socialLink.link);
  const [isEditingThis, setIsEditingThis] = useState(false);

  const handleSave = () => {
    onSave(name.trim(), link.trim());
    setIsEditingThis(false);
  };

  const handleCancel = () => {
    setName(socialLink.name);
    setLink(socialLink.link);
    setIsEditingThis(false);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canSave = name.trim() && link.trim() && isValidUrl(link.trim());

  if (isEditing && isEditingThis) {
    return (
      <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
        <div className="space-y-2">
          <Label htmlFor={`name-${socialLink.id}`} className="text-sm font-medium">
            Platform Name
          </Label>
          <Input
            id={`name-${socialLink.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., LinkedIn, Twitter, GitHub"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`link-${socialLink.id}`} className="text-sm font-medium">
            Profile URL
          </Label>
          <Input
            id={`link-${socialLink.id}`}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!canSave || isLoading}
          >
            {isLoading ? (
              <LoaderIcon className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <SaveIcon className="h-3 w-3 mr-1" />
            )}
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
            <XIcon className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0 max-w-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Label className="font-medium text-sm">{socialLink.name}</Label>
          {!isEditing && (
            <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        {isEditing ? (
          <div className="text-sm text-muted-foreground truncate mt-1">
            {socialLink.link}
          </div>
        ) : (
          <Link
            to={socialLink.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline truncate block mt-1"
          >
            {socialLink.link}
          </Link>
        )}
      </div>

      {isEditing && (
        <div className="flex gap-1 ml-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingThis(true)}
            disabled={isLoading}
          >
            <EditIcon className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderIcon className="h-3 w-3 animate-spin" />
            ) : (
              <TrashIcon className="h-3 w-3" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface NewSocialLinkProps {
  onSave: (name: string, link: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function NewSocialLink({ onSave, onCancel, isLoading }: NewSocialLinkProps) {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');

  const handleSave = () => {
    onSave(name.trim(), link.trim());
    setName('');
    setLink('');
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canSave = name.trim() && link.trim() && isValidUrl(link.trim());

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
      <div className="space-y-2">
        <Label htmlFor="new-name" className="text-sm font-medium">
          Platform Name
        </Label>
        <Input
          id="new-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., LinkedIn, Twitter, GitHub"
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-link" className="text-sm font-medium">
          Profile URL
        </Label>
        <Input
          id="new-link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!canSave || isLoading}
        >
          {isLoading ? (
            <LoaderIcon className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <SaveIcon className="h-3 w-3 mr-1" />
          )}
          Add Social Link
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
          <XIcon className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
