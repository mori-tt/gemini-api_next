"use client";
import React, { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Gemini: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [imagePrompt, setImagePrompt] = useState<string>(""); // 画像と一緒に送信するテキスト用の状態
  const [output, setOutput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_KEY: string = process.env.NEXT_PUBLIC_API_KEY || "デフォルト値";
  const genAI = new GoogleGenerativeAI(API_KEY);

  const sendText = async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setOutput(await response.text());
    } catch (error) {
      console.error("Error fetching text:", error);
      setOutput("テキストの取得中にエラーが発生しました。");
    }
  };

  const sendTextAndImages = async () => {
    if (!fileInputRef.current?.files) return;
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    try {
      const imageParts = await Promise.all(
        Array.from(fileInputRef.current.files).map(async (file) => {
          const base64EncodedData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          return {
            inlineData: {
              data: base64EncodedData.split(",")[1],
              mimeType: file.type,
            },
          };
        })
      );
      // 画像と一緒に送信するテキストも含める
      const result = await model.generateContent([imagePrompt, ...imageParts]);
      const response = await result.response;
      setOutput(await response.text());
    } catch (error) {
      console.error("Error fetching text and images:", error);
      setOutput("テキストと画像の取得中にエラーが発生しました。");
    }
  };

  return (
    <div className="m-8">
      <h1 className="text-2xl font-bold mb-4">Gemini</h1>
      <section className="border border-gray-400 p-4 mb-8">
        <label htmlFor="prompt" className="block mb-2">
          プロンプト:
        </label>
        <input
          type="text"
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-8 text-xl p-2"
        />
        <div className="flex space-x-2 mt-2">
          <button
            onClick={sendText}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            送信する
          </button>
        </div>
      </section>
      <section className="mb-8">
        <label htmlFor="imagePrompt" className="block mb-2">
          画像に関するテキスト:
        </label>
        <input
          type="text"
          id="imagePrompt"
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          className="w-full h-8 text-xl p-2 mb-2"
        />
        <label htmlFor="files" className="block mb-2">
          画像:
        </label>
        <input
          type="file"
          id="files"
          multiple
          ref={fileInputRef}
          className="block"
        />
        <button
          onClick={sendTextAndImages}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          送信する
        </button>
      </section>
      <section className="mb-8">
        <label htmlFor="output" className="block mb-2">
          出力:
        </label>
        <p className="text-xl max-h-96 overflow-y-auto" id="output">
          {output}
        </p>
      </section>
    </div>
  );
};

export default Gemini;
