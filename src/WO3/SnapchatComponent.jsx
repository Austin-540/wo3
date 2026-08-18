import React, { useRef, useEffect } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import DOMPurify from "dompurify";

const BubbleTail = ({ side, color }) => {
    const tailStyle = {
        position: "absolute",
        bottom: 0,
        width: "15px",
        height: "15px",
        ...(side === "left"
            ? { left: "-2px", transform: "scaleX(-1)" }
            : { right: "-2px" }),
    };

    return (
        <div style={tailStyle}>
            <svg
                viewBox="0 0 15 15"
                style={{ width: "100%", height: "100%", display: "block" }}
            >
                <path d="M0 15 L0 0 Q10 10, 15 15 Z" fill={color} />
            </svg>
        </div>
    );
};

const MessageButton = ({ i, buttonText, buttonClass, onClick, rightOffset, tooltip, color }) => {
    return (
        <button
            className={buttonClass}
            onClick={() => onClick(i)}
            style={{
                position: "absolute",
                top: "20px",
                right: rightOffset,
                background: color,
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                minWidth: "18px",
                minHeight: "18px",
                cursor: "pointer",
                fontSize: "10px",
                opacity: "0",
                transition: "opacity 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                lineHeight: "1",
                padding: "0",
            }}
            title={tooltip}
        >
            {buttonText}
        </button>
    )
}

export const SnapchatComponent = ({ node, updateAttributes }) => {
    const { groupName, groupIcon, people, messages } = node.attrs; // ORIGINAL - No defaults!

    const groupNameRef = useRef(null);
    const messageRefs = useRef([]);
    const peopleNameRefs = useRef([]);

    useEffect(() => {
        if (groupNameRef.current) groupNameRef.current.innerText = groupName;

        people.forEach((person, i) => {
            if (
                peopleNameRefs.current[i] &&
                peopleNameRefs.current[i].innerText !== person.name
            ) {
                peopleNameRefs.current[i].innerText = person.name;
            }
        });

        messages.forEach((msg, i) => {
            if (
                messageRefs.current[i] &&
                messageRefs.current[i].innerText !== msg.text
            ) {
                messageRefs.current[i].innerText = msg.text;
            }
        });
    }, [messages, groupName, people]);

    const handleGroupNameBlur = () => {
        updateAttributes({ groupName: groupNameRef.current.innerText });
    };

    const handleGroupIconChange = () => {
        const src = prompt("Enter group icon URL:", groupIcon || "");
        if (src !== null) updateAttributes({ groupIcon: src });
    };

    const handlePersonNameBlur = (index) => {
        const updated = [...people];
        updated[index] = {
            ...updated[index],
            name: peopleNameRefs.current[index].innerText,
        };
        updateAttributes({ people: updated });
    };

    const handleMessageBlur = (index) => {
        const updated = [...messages];
        updated[index] = {
            ...updated[index],
            text: messageRefs.current[index].innerText,
        };
        updateAttributes({ messages: updated });
    };

    const handlePersonColorChange = (index, value) => {
        const updated = [...people];
        updated[index] = { ...updated[index], color: value };
        updateAttributes({ people: updated });
    };

    const changePersonImage = (index) => {
        const src = prompt(
            "Enter profile image URL:",
            people[index].profileImageSrc || ""
        );
        if (src !== null) {
            const updated = [...people];
            updated[index] = { ...updated[index], profileImageSrc: src };
            updateAttributes({ people: updated });
        }
    };

    const getNextPersonColor = () => {
        const presetColors = ["#FFDDDD", "#FFDFFF", "#DDFFEE", "#CCDDFF", "#C7E7F8", "#FFE2C8", "#FFFBD5", "#CCD0D7", "#CEFFFF", "#E3E1C8"];
        return presetColors[people.length % presetColors.length];
    };

    const addPerson = () => {
        const newId = Date.now().toString();
        updateAttributes({
            people: [
                ...people,
                {
                    id: newId,
                    name: "New Person",
                    color: getNextPersonColor(),
                    profileImageSrc: "",
                },
            ],
        });
    };

    const removePerson = (personId) => {
        updateAttributes({
            people: people.filter((p) => p.id !== personId),
            messages: messages.filter((m) => m.personId !== personId),
        });
    };

    const addMessage = (personId) => {
        updateAttributes({
            messages: [...messages, { personId, text: "New message...", id: crypto.randomUUID(), useHtml: false }],
        });
    };

    const removeMessage = (index) => {
        const updatedMessages = messages.filter((_, i) => i !== index);
        updateAttributes({ messages: updatedMessages });
    };

    const getPerson = (personId) => {
        if (personId === "!system") return { id: "!system", name: "System", color: "#000", profileImageSrc: "" };
        return people.find((p) => p.id === personId);
    };

    const editHtmlMessage = (i) => {
        const newHtml = prompt("Update HTML message:", messages[i].text || "")
        if (newHtml == null || newHtml === "") return;

        updateAttributes({
            messages: messages.map((msg, j) => {
                if (i === j) {
                    return { personId: msg.personId, text: newHtml, id: msg.id, useHtml: true };
                }
                return msg
            })
        })
    }

    const changeMessageToHtml = (i, newHtml) => {


        updateAttributes({
            messages: messages.map((msg, j) => {
                if (i === j) {
                    newHtml ??= (msg.text === "" || msg.text === "New message...") ?
                        "Click to edit HTML" : msg.text
                    return {
                        personId: msg.personId,
                        text: newHtml,
                        id: msg.id,
                        useHtml: true
                    };
                }
                return msg
            })
        })
    }

    const changeMessageToImage = (i) => {
        const imageUrl = prompt("Enter image URL:\n(this will replace the selected message's text)");
        if (!imageUrl || imageUrl === "") return;

        changeMessageToHtml(i, `<img src="${imageUrl}">`)
    }

    const changeMessageToTypingIndicator = (i) => {
        changeMessageToHtml(i, '<div class="typing-indicator-container" style="display: flex;justify-content: space-around;align-items: center;width: 80px;height:40px;"><div class="typing-indicator-circle" style="width: 15px;height: 15px;background-color: #FFF;border-radius: 50%;"></div><div class="typing-indicator-circle" style="width: 15px;height: 15px;background-color: #FFF;border-radius: 50%;"></div><div class="typing-indicator-circle" style="width: 15px;height: 15px;background-color: #FFF;border-radius: 50%;"></div></div>'); 
    }

    return (
        <NodeViewWrapper
            as="div"
            style={{
                display: "flex",
                justifyContent: "center",
                margin: "16px 0",
            }}
        >
            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "16px",
                    background: "white",
                    maxWidth: "600px",
                    width: "100%",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                {/* Group Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "16px",
                        paddingBottom: "12px",
                        borderBottom: "1px solid #eee",
                    }}
                >
                    <img
                        src={
                            groupIcon ||
                            "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                        }
                        alt="Group"
                        onClick={handleGroupIconChange}
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            cursor: "pointer",
                            marginRight: "12px",
                        }}
                    />
                    <div
                        ref={groupNameRef}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={handleGroupNameBlur}
                        style={{
                            fontWeight: "bold",
                            fontSize: "18px",
                            outline: "none",
                            flex: 1,
                        }}
                    />
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {people.length} member{people.length !== 1 ? "s" : ""}
                    </div>
                </div>

                {/* People Management */}
                <div
                    style={{
                        marginBottom: "16px",
                        padding: "12px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e9ecef",
                    }}
                >
                    <div
                        style={{
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                        }}
                    >
                        Manage People:
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "12px",
                        }}
                    >
                        {people.map((person, i) => {
                            if (!peopleNameRefs.current[i]) peopleNameRefs.current[i] = {};
                            return (
                                <div
                                    key={person.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        background: "white",
                                        border: "1px solid #ddd",
                                        borderRadius: "20px",
                                        padding: "6px 12px",
                                        fontSize: "12px",
                                        gap: "8px",
                                    }}
                                >
                                    <img
                                        src={
                                            person.profileImageSrc ||
                                            "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                                        }
                                        alt="Profile"
                                        onClick={() => changePersonImage(i)}
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            cursor: "pointer",
                                        }}
                                    />

                                    <div
                                        ref={(el) => (peopleNameRefs.current[i] = el)}
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={() => handlePersonNameBlur(i)}
                                        style={{ outline: "none", minWidth: "40px" }}
                                    />

                                    {/* Color picker swatch */}
                                    <div style={{ position: "relative", width: 16, height: 16 }}>
                                        <div
                                            title="Change color"
                                            style={{
                                                width: 14,
                                                height: 14,
                                                borderRadius: "50%",
                                                background: person.color,
                                                border: "1px solid #ccc",
                                                pointerEvents: "none",
                                            }}
                                        />
                                        <input
                                            type="color"
                                            value={person.color}
                                            onChange={(e) =>
                                                handlePersonColorChange(i, e.target.value)
                                            }
                                            style={{
                                                position: "absolute",
                                                top: -2,
                                                left: -2,
                                                width: 20,
                                                height: 20,
                                                opacity: 0,
                                                cursor: "pointer",
                                            }}
                                            aria-label={`Pick color for ${person.name}`}
                                        />
                                    </div>

                                    <button
                                        onClick={() => removePerson(person.id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#666",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            padding: 0,
                                            width: 16,
                                            height: 16,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                        title="Remove person"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}

                        <button
                            onClick={addPerson}
                            style={{
                                background: "#007bff",
                                border: "none",
                                borderRadius: "20px",
                                padding: "6px 12px",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "12px",
                            }}
                        >
                            + Add Person
                        </button>
                    </div>


                </div>

                {/* Messages */}
                <div>
                    {messages.map((msg, i) => {
                        const person = getPerson(msg.personId);
                        if (!person) return null;


                        if (msg.personId == "!system") {
                            return (
                                <div
                                    key={msg.id}
                                    style={{ marginBottom: "16px", position: "relative" }}
                                    onMouseEnter={(e) => {
                                        const deleteBtn = e.currentTarget.querySelector(".delete-btn");
                                        if (deleteBtn) deleteBtn.style.opacity = "1";
                                    }}
                                    onMouseLeave={(e) => {
                                        const deleteBtn = e.currentTarget.querySelector(".delete-btn");
                                        if (deleteBtn) deleteBtn.style.opacity = "0";
                                    }}
                                >
                                    <button
                                        className="delete-btn"
                                        onClick={() => removeMessage(i)}
                                        style={{
                                            position: "absolute",
                                            top: "20px",
                                            right: "8px",
                                            background: "#ff4444",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "18px",
                                            height: "18px",
                                            minWidth: "18px",
                                            minHeight: "18px",
                                            cursor: "pointer",
                                            fontSize: "10px",
                                            opacity: "0",
                                            transition: "opacity 0.2s",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            zIndex: 1,
                                            lineHeight: "1",
                                            padding: "0",
                                        }}
                                        title="Delete system message"
                                    >
                                        ×
                                    </button>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        <div style={{ position: "relative", maxWidth: "70%" }}>
                                            <div
                                                ref={(el) => (messageRefs.current[i] = el)}
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={() => handleMessageBlur(i)}
                                                style={{
                                                    background: "#FFF",
                                                    color: "#000",
                                                    padding: "8px 12px",
                                                    borderRadius: "18px",
                                                    outline: "none",
                                                    wordWrap: "break-word",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (msg.useHtml) {
                            return (
                                <div
                                    key={msg.id}
                                    style={{ marginBottom: "16px", position: "relative" }}
                                    onMouseEnter={(e) => {
                                        const deleteBtn = e.currentTarget.querySelector(".delete-btn");
                                        if (deleteBtn) deleteBtn.style.opacity = "1";
                                    }}
                                    onMouseLeave={(e) => {
                                        const deleteBtn = e.currentTarget.querySelector(".delete-btn");
                                        if (deleteBtn) deleteBtn.style.opacity = "0";
                                    }}
                                >
                                    <MessageButton
                                        color="#FF4444"
                                        onClick={removeMessage}
                                        rightOffset="8px"
                                        buttonClass="delete-btn"
                                        tooltip="Delete message"
                                        buttonText="×"
                                        i={i}
                                    />

                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#666",
                                            fontWeight: 500,
                                            marginBottom: "4px",
                                            marginLeft: "40px",
                                        }}
                                    >
                                        {person.name}
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-end",
                                            gap: "8px",
                                        }}
                                    >
                                        <img
                                            src={
                                                person.profileImageSrc ||
                                                "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                                            }
                                            alt={person.name}
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                flexShrink: 0,
                                            }}
                                        />
                                        <div style={{ position: "relative", maxWidth: "70%" }}>
                                            <button
                                                onClick={() => editHtmlMessage(i)}
                                                style={{
                                                    background: "rgba(0,0,0,0)",
                                                    border: "none",
                                                    paddingBottom: "0px"
                                                }}
                                            >


                                                <div
                                                    ref={(el) => (messageRefs.current[i] = el)}
                                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }} 
                                                    onBlur={() => handleMessageBlur(i)}
                                                    style={{
                                                        background: person.color,
                                                        color: "#000",
                                                        padding: "8px 12px",
                                                        borderRadius: "18px 18px 18px 5px",
                                                        outline: "none",
                                                        wordWrap: "break-word",
                                                        display: "inline-block"
                                                    }}
                                                />
                                                <BubbleTail side="left" color={person.color} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return ( // non-html non-system messages
                            <div
                                key={msg.id}
                                style={{ marginBottom: "16px", position: "relative" }}
                                onMouseEnter={(e) => {
                                    const deleteBtn = e.currentTarget.querySelector(".delete-btn");
                                    const makeHtmlBtn = e.currentTarget.querySelector(".make-html-btn")
                                    const makeImageBtn = e.currentTarget.querySelector(".make-image-btn");
                                    const makeTypingIndicatorBtn = e.currentTarget.querySelector(".make-typing-indicator-btn");
                                    if (deleteBtn) deleteBtn.style.opacity = "1";
                                    if (makeHtmlBtn) makeHtmlBtn.style.opacity = "1";
                                    if (makeImageBtn) makeImageBtn.style.opacity = "1";
                                    if (makeTypingIndicatorBtn) makeTypingIndicatorBtn.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                    const deleteBtn = e.currentTarget.querySelector(".delete-btn");
                                    const makeHtmlBtn = e.currentTarget.querySelector(".make-html-btn");
                                    const makeImageBtn = e.currentTarget.querySelector(".make-image-btn");
                                    const makeTypingIndicatorBtn = e.currentTarget.querySelector(".make-typing-indicator-btn");
                                    if (deleteBtn) deleteBtn.style.opacity = "0";
                                    if (makeHtmlBtn) makeHtmlBtn.style.opacity = "0";
                                    if (makeImageBtn) makeImageBtn.style.opacity = "0";
                                    if (makeTypingIndicatorBtn) makeTypingIndicatorBtn.style.opacity = "0";
                                }}
                            >
                                <MessageButton
                                    color="#FF4444"
                                    onClick={removeMessage}
                                    rightOffset="8px"
                                    buttonClass="delete-btn"
                                    tooltip="Delete message"
                                    buttonText="×"
                                    i={i}
                                />

                                <MessageButton
                                    color="#39A3FF"
                                    onClick={changeMessageToHtml}
                                    rightOffset="30px"
                                    buttonClass="make-html-btn"
                                    tooltip="Change to HTML message"
                                    buttonText="&lt;&gt;"
                                    i={i}
                                />

                                <MessageButton
                                    color="#292169"
                                    onClick={changeMessageToImage}
                                    rightOffset="52px"
                                    buttonClass="make-image-btn"
                                    tooltip="Change to image"
                                    buttonText="🎆"
                                    i={i}
                                />

                                <MessageButton
                                    color="#565557"
                                    onClick={changeMessageToTypingIndicator}
                                    rightOffset="74px"
                                    buttonClass="make-typing-indicator-btn"
                                    tooltip="Change to typing indicator"
                                    buttonText="💬"
                                    i={i}
                                />

                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#666",
                                        fontWeight: 500,
                                        marginBottom: "4px",
                                        marginLeft: "40px",
                                    }}
                                >
                                    {person.name}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: "8px",
                                    }}
                                >
                                    <img
                                        src={
                                            person.profileImageSrc ||
                                            "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                                        }
                                        alt={person.name}
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            flexShrink: 0,
                                        }}
                                    />
                                    <div style={{ position: "relative", maxWidth: "70%" }}>
                                        <div
                                            ref={(el) => (messageRefs.current[i] = el)}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={() => handleMessageBlur(i)}
                                            style={{
                                                background: person.color,
                                                color: "#000",
                                                padding: "8px 12px",
                                                borderRadius: "18px 18px 18px 5px",
                                                outline: "none",
                                                wordWrap: "break-word",
                                            }}
                                        />
                                        <BubbleTail side="left" color={person.color} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>


                {people.length > 0 && (
                    <div
                        style={{
                            marginBottom: "16px",
                            padding: "12px",
                            background: "#f8f9fa",
                            borderRadius: "8px",
                            border: "1px solid #e9ecef",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    marginBottom: "6px",
                                    color: "#666",
                                }}
                            >
                                Add message from:
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                <button
                                    key={"!system"}
                                    onClick={() => addMessage("!system")}
                                    style={{
                                        background: "#333",
                                        border: "none",
                                        borderRadius: "12px",
                                        padding: "4px 8px",
                                        cursor: "pointer",
                                        fontSize: "10px",
                                        color: "#EEE",
                                        fontWeight: "bold",
                                    }}
                                >
                                    + System Message
                                </button>

                                {people.map((person) => (
                                    <button
                                        key={person.id}
                                        onClick={() => addMessage(person.id)}
                                        style={{
                                            background: person.color,
                                            border: "none",
                                            borderRadius: "12px",
                                            padding: "4px 8px",
                                            cursor: "pointer",
                                            fontSize: "10px",
                                            color: "#000",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        + {person.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};
