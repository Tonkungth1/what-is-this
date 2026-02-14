import base64, os, requests

API_KEY = os.getenv("GEMINI_API_KEY")

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

URL = f"https://generativelanguage.googleapis.com/v1/models/{MODEL}:generateContent"

async def analyze_image(file):

    if not API_KEY:
        return {"prediction":"API KEY ไม่ถูกตั้งค่า"}

    image_bytes = await file.read()
    image_base64 = base64.b64encode(image_bytes).decode()

    mime = file.content_type or "image/jpeg"
    if mime == "image/jpg":
        mime = "image/jpeg"

    prompt = """
คุณคือผู้เชี่ยวชาญด้านชีววิทยา

จงวิเคราะห์ภาพนี้ แล้วตอบตาม format เท่านั้น

ถ้ามีสัตว์ 1 ตัว:
สิ่งมีชีวิตในภาพคือ: <ชื่อไทย> (<ชื่ออังกฤษ>)

ข้อมูลที่น่าสนใจ:
- ...
- ...
- ...

ถ้ามีสัตว์มากกว่า 1 ตัว:
ให้เรียงลำดับเป็นข้อ

1. <ชื่อไทย> (<ชื่ออังกฤษ>)
คำอธิบาย:
- ...
- ...

2. <ชื่อไทย> (<ชื่ออังกฤษ>)
คำอธิบาย:
- ...
- ...

กฎ:
- ถ้าไม่ใช่สัตว์เลยให้ตอบว่า "ไม่ใช่สัตว์"
- ห้ามตอบนอก format
- ห้ามมีข้อความเกินจากรูปแบบที่กำหนด
"""


    body = {
        "generationConfig":{"temperature":0.2},
        "contents":[
            {
                "parts":[
                    {"text": prompt},
                    {
                        "inline_data":{
                            "mime_type": mime,
                            "data": image_base64
                        }
                    }
                ]
            }
        ]
    }

    try:
        res = requests.post(
            URL,
            params={"key": API_KEY},
            json=body,
            headers={"Content-Type":"application/json"},
            timeout=30
        )

        print("STATUS:", res.status_code)
        print("RESPONSE:", res.text[:500])

    except Exception as e:
        return {"prediction":"เชื่อมต่อ AI ไม่สำเร็จ","error":str(e)}

    if res.status_code != 200:
        return {"prediction":"API ERROR","error":res.text}

    data = res.json()

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return {"prediction":"อ่านผลลัพธ์ไม่สำเร็จ","error":data}

    return {"prediction": text.strip()}
