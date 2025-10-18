import axios from "axios";

export const getTimedFilename = (name, ext) => {
  const timeStamp = Math.floor(Date.now() / 1000).toString();
  return `${name}-${timeStamp}.${ext}`;
};

export const getClientIp = (request) => {
  let ip;

  ip = request.ip ?? request.headers.get("x-real-ip");
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? null;
  }

  return ip;
};

export const makeSuccessResponse = (data) => {
  const response = {
    status: "success",
    data: data,
  };
  return response;
};

export const makeErrorResponse = (message = "Internal Server Error") => {
  const response = {
    status: "error",
    message: message,
  };
  return response;
};

export const makeHttpRequest = async ({ ...args }) => {
  try {
    const response = await axios(args);
    return response;
  } catch (error) {
    const axiosError = error;
    if (axiosError.response) {
      console.error("Axios Error:", axiosError.message);
      throw new Error(axiosError.message);
    } else if (axiosError.request) {
      console.error("Request Error:", axiosError.request);
      throw new Error();
    } else {
      console.error("Server Error:", axiosError.message);
      throw new Error("Something went wrong, please try again.");
    }
  }
};

export const downloadVideoAsBase64 = async (videoUrl) => {
  try {
    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0",
      },
    });

    const base64 = Buffer.from(response.data, "binary").toString("base64");
    return base64;
  } catch (error) {
    console.error("Error downloading video:", error.message);
    throw new Error("Failed to download video");
  }
};
