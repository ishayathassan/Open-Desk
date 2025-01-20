export const fetchUniversities = async () => {
  try {
    const response = await fetch("http://localhost:5000/universities"); // JSON server URL for universities
    if (!response.ok) throw new Error("Failed to fetch universities");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchPrograms = async () => {
  try {
    const response = await fetch("http://localhost:5000/programs"); // JSON server URL for programs
    if (!response.ok) throw new Error("Failed to fetch programs");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};
