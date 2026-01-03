const API_URL = "http://localhost:5000/api/comments";

export const fetchComments = async (resourceType, resourceId) => {
  const res = await fetch(`${API_URL}/${resourceType}/${resourceId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch comments");
  }

  return res.json();
};

export const postComment = async ({
  resourceType,
  resourceId,
  text,
  token,
}) => {
  const res = await fetch(`${API_URL}/${resourceType}/${resourceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      text,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to post comment");
  }

  return res.json();
};
