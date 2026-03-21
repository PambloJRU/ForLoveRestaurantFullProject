import axios from "axios";

const API = "http://localhost:5151/api/announcements";

export const getAnnouncements = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const createAnnouncement = async (data: any) => {
  const res = await axios.post(API, data);
  return res.data;
};

export const updateAnnouncement = async (id: number, data: any) => {
  const res = await axios.put(`${API}/${id}`, data);
  return res.data;
};

export const deleteAnnouncement = async (id: number) => {
  await axios.delete(`${API}/${id}`);
};