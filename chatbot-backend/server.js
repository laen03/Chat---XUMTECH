const express = require("express");
const cors = require("cors");
const admin = require("./firebase-admin");
const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();
const stringSimilarity = require("string-similarity");

const PORT = process.env.PORT || 3000;
const db = admin.firestore();

function normalizeText(text) {
  // Trim the string
  let result = text.trim();

  // Normalize the string (removing accents and signs)
  result = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "");
  return result;
}

function matchesRelatedWords(relatedWords, userText) {
  console.log("relatedWords:", relatedWords, "----- userText", userText);
  const userWords = normalizeText(userText).split(" ");

  return relatedWords.some((word) => userWords.includes(normalizeText(word)));
}

app.post("/api/process-response", async (req, res) => {
  const userQuestion = req.body.question;
  const minSimilarityRate = 0.6;

  if (!userQuestion) {
    return res.status(400).json({ error: "La pregunta es obligatoria" });
  }

  try {
    const querySnapshot = await db.collection("questions").get();
    let foundAnswer = null;
    let bestMatch = { rating: 0, question: null, answer: null };
    for (const doc of querySnapshot.docs) {
      //Normalize texts
      let nomalizedUserQuestion = normalizeText(userQuestion);
      let nomalizedSystemQuestion = normalizeText(doc.id);

      const data = doc.data();
      //If the text is the exact same
      if (nomalizedSystemQuestion === nomalizedUserQuestion) {
        foundAnswer = data.answer;
        break;
      }
      // Check if texts have high similarity
      const similarity = stringSimilarity.compareTwoStrings(
        nomalizedUserQuestion,
        nomalizedSystemQuestion
      );

      console.log(
        "system:",
        nomalizedSystemQuestion,
        "  |  user:",
        nomalizedUserQuestion,
        similarity
      );
      if (similarity > bestMatch.rating) {
        bestMatch = {
          rating: similarity,
          question: doc.id,
          answer: data.answer,
        };
      }

      if (similarity >= minSimilarityRate) {
        foundAnswer = data.answer;
        break;
      }
      // Check if any word of the received text is on the related words
      else if (matchesRelatedWords(data.relatedWords, nomalizedUserQuestion)) {
        foundAnswer = data.answer;
        break;
      }

      //Ver si tiene una similitud entre 75% y 61%. En este caso decir "Creo que quisiste decir X, [respuesta de X]"
    }
    if (foundAnswer) {
      return res.status(200).json({ answer: foundAnswer });
    } else if (
      !foundAnswer &&
      bestMatch.rating <= 0.59 &&
      bestMatch.rating >= 0.3
    ) {
      return res.status(200).json({
        message: `Me parece que quisiste decir ' ${bestMatch.question} '... Siendo así: ${bestMatch.answer}`,
      });
    } else {
      return res.status(200).json({
        message: `Lo siento, no entendí tu consulta... Prueba preguntándome "¿qué puedes hacer?"`,
      });
    }
  } catch (error) {
    console.error("Error al obtener la respuesta:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}. http://localhost:${PORT}`);
});
