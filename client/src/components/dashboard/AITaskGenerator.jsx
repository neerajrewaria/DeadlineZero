import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTaskWithAI } from "../../services/operations/taskAPI";
import "./AITaskGenerator.css";

function AITaskGenerator() {
  const [prompt, setPrompt] = useState("");

  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.task);

  const submitHandler = (e) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    dispatch(createTaskWithAI(prompt, token));

    setPrompt("");
  };

  return (
    <div className="ai-generator-card">

      <div className="ai-header">
        <div className="ai-icon">🤖</div>

        <div>
          <h2>AI Task Generator</h2>
          <p>
            Describe your work naturally and let AI create an optimized task
            list.
          </p>
        </div>
      </div>

      <form onSubmit={submitHandler}>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={7}
          placeholder={`Example:

• React interview on Monday
• DBMS Assignment tomorrow
• Complete DSA Sheet till Question 120
• Gym everyday for one hour
• Revise Operating System before Friday`}
        />

        <div className="prompt-footer">

          <span>
            💡 AI will automatically detect deadlines, priorities and estimated
            hours.
          </span>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Generating..." : "✨ Generate Tasks"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default AITaskGenerator;