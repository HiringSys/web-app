import type { Candidate, SocialLink, SocialNetwork } from "@/components/ui/table/types";
import type { SelectiveProcess } from "@/types/peneira";

import stageMocks from "./stage.json";
import personMocks from "./person.json";

import curriculumPdfUrl from "./curriculum/document.pdf?url";
import curriculumDocxUrl from "./curriculum/word.docx?url";
import curriculumImageUrl from "./curriculum/image.png?url";

const curriculumFiles: Record<string, string> = {
  "document.pdf": curriculumPdfUrl,
  "word.docx": curriculumDocxUrl,
  "image.png": curriculumImageUrl,
};

interface RawPerson extends Omit<Candidate, "networks"> {
  networks?: SocialNetwork[];
  curriculumFile?: string;
}

function toSocialLink(network: SocialNetwork): SocialLink {
  return { network, url: `https://${network}.com` };
}

export function getStageMocks(): SelectiveProcess[] {
  return stageMocks as SelectiveProcess[];
}

// Only stage id 1 ships with a full candidate mock (it's the one used to
// demonstrate the approve/reject drag mechanic end to end, matching the
// design mockup: 5 approved + 2 rejected against an approvalLimit of 5).
// Every other stage intentionally has no entry and resolves to an empty list.
export function getPersonMocksForStage(stageId: string | number): Candidate[] {
  const people = (personMocks as Record<string, RawPerson[]>)[stageId] ?? [];
  return people.map(({ curriculumFile, ...person }) => ({
    ...person,
    networks: person.networks?.map(toSocialLink),
    curriculumUrl: curriculumFile ? curriculumFiles[curriculumFile] : undefined,
  })) as Candidate[];
}
