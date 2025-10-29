export const generateCurriculum = async (language: string, enterprise: string, candidate: string, empTitle?: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generator/curriculum`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ language, enterprise, candidate, empTitle }),
    });

    if (response.ok) {
      const blob = await response.blob();
      // Try to get filename from Content-Disposition header set by server
      const contentDisposition = response.headers.get('content-disposition') || '';
      let filename = '';
      const match = /filename\*?=(?:UTF-8'')?"?([^";\n]+)/i.exec(contentDisposition);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      } else if (empTitle) {
        const safe = empTitle.replace(/[^a-zA-Z0-9-_\. ]/g, '_').trim() || 'curriculum';
        filename = `${safe}.zip`;
      } else {
        filename = 'curriculum.zip';
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
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