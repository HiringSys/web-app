<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-dvh min-w-0 w-full bg-white">
    <section class="flex min-w-0 w-full flex-col items-stretch justify-center gap-6 px-4 py-8 sm:items-start sm:gap-8 sm:px-12 sm:py-10 lg:w-[58%] lg:px-[clamp(4rem,8vw,9rem)]">
        <img class="w-32 sm:w-40" src="/logotype.svg" alt="HiringSys">
        <RouterView />
    </section>
    <section class="login-hero relative hidden flex-1 overflow-hidden lg:flex lg:items-end lg:p-12" aria-label="Apresentação do HiringSys">
      <div class="relative z-10 max-w-md rounded-medium border border-white/20 bg-black/10 p-8 text-white backdrop-blur-sm">
        <p class="mb-3 text-small font-bold uppercase tracking-[0.18em] text-white/75">Processos mais humanos</p>
        <h1 class="text-white">Contrate com clareza, do início ao resultado.</h1>
        <p class="mt-4 text-white/80">Organize candidatos, acompanhe etapas e transforme decisões em uma experiência simples para o RH.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-hero {
  background:
    radial-gradient(circle at 82% 18%, rgb(255 255 255 / 0.28) 0 7rem, transparent 7.1rem),
    radial-gradient(circle at 15% 38%, rgb(177 140 255 / 0.42) 0 10rem, transparent 10.1rem),
    linear-gradient(145deg, var(--color-blue-co), var(--color-blue) 55%, var(--color-purple));
}
.login-hero::before,
.login-hero::after {
  content: "";
  position: absolute;
  border: 1px solid rgb(255 255 255 / 0.22);
  border-radius: 2rem;
  transform: rotate(-12deg);
}
.login-hero::before { width: 18rem; height: 24rem; top: 13%; right: 8%; }
.login-hero::after { width: 13rem; height: 18rem; top: 23%; right: 20%; }
</style>
