export const generateCurriculum = async (language: string, enterprise: string, candidate: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generator/curriculum`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ language, enterprise, candidate }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "curriculum.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error("Error generating curriculum:", errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error("Error generating curriculum:", error);
    return { success: false, error: (error as Error).message };
  }
};