const API_URL = "http://localhost:5000/api/reactions";

export const toggleReaction = async ({
  resourceType,
  resourceId,
  type,
  token,
}) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      resourceType,
      resourceId,
      type,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to toggle reaction");
  }

  return res.json();
};

