<template>
  <div class="home-page">
    <SiteHeader @book="bookingDialog?.open()" />
    <main>
      <HeroSection @book="bookingDialog?.open()" />
      <ServicesSection @book="bookingDialog?.open()" />
      <AboutSection />
      <ProcessSection />
      <AdvantagesSection />
      <ReviewsSection />
      <FaqSection />
      <ContactsSection @book="bookingDialog?.open()" />
    </main>
    <SiteFooter />
    <BackToTop />
    <BookingDialog ref="bookingDialog" />
  </div>
</template>

<script setup lang="ts">
const bookingDialog = useTemplateRef('bookingDialog');
</script>
