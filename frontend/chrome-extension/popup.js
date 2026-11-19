const ACADEMY_ORIGIN = "https://ahadu-tech-academys.vercel.app";

document.querySelectorAll("[data-route]").forEach((button) => {
  button.addEventListener("click", async () => {
    const route = button.getAttribute("data-route") || "/";
    const destination = new URL(route, ACADEMY_ORIGIN);

    if (destination.origin !== ACADEMY_ORIGIN) {
      return;
    }

    try {
      await chrome.tabs.create({ url: destination.toString() });
      window.close();
    } catch (error) {
      const status = document.getElementById("status");
      if (status) status.textContent = "Could not open the academy. Please try again.";
      console.error("Ahadu Tech Academy extension navigation failed:", error);
    }
  });
});
