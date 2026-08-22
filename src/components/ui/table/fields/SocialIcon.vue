<script setup lang="ts">

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { SocialNetwork, type SocialNetwork as SocialNetworkValue } from "../types";
import openInNewTab        from "@/utils/openInNewTab";
import {
  faBehance,
  faDribbble,
  faFacebook,
  faGithub,
  faGitlab,
  faInstagram,
  faLinkedin,
  faTiktok,
  faWhatsapp,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

const socialIcons = {
  [SocialNetwork.LinkedIn]: faLinkedin,
  [SocialNetwork.GitHub]: faGithub,
  [SocialNetwork.Instagram]: faInstagram,
  [SocialNetwork.Facebook]: faFacebook,
  [SocialNetwork.X]: faXTwitter,
  [SocialNetwork.WhatsApp]: faWhatsapp,
  [SocialNetwork.GitLab]: faGitlab,
  [SocialNetwork.Behance]: faBehance,
  [SocialNetwork.Dribbble]: faDribbble,
  [SocialNetwork.TikTok]: faTiktok,
} satisfies Record<SocialNetworkValue, typeof faLinkedin>;

const props = withDefaults(
  defineProps<{
    network: SocialNetworkValue;
    url: string;
    size?: number;
  }>(),
  { size: 16 },
);

</script>

<template>
  <FontAwesomeIcon
    :icon="socialIcons[network]"
    :style="{ width: `${size}px`, height: `${size}px`, stroke: 'currentColor', strokeWidth: 3 }"
    class="text-black/40 hover:text-black/80 transition-colors duration-200 cursor-pointer"
    @click="openInNewTab(props.url)"
  />
</template>
