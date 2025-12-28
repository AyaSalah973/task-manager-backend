const service = require("./task.service");

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await service.getAll(req.userId, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: "Title is required" });
    }
    
    const task = await service.create(req.userId, { title, description });
    res.status(201).json({ 
      message: "Task created successfully",
      task 
    });
  } catch (error) {
    console.error("Error in create task:", error);
    
    if (error.message === "Title is required") {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    if (!title && !description && !status) {
      return res.status(400).json({ message: "No fields to update" });
    }
    
    const task = await service.update(req.userId, req.params.id, { 
      title, 
      description, 
      status 
    });
    
    res.json({ 
      message: "Task updated successfully",
      task 
    });
  } catch (error) {
    console.error("Error in update task:", error);
    
    if (error.message.includes("not found") || error.message.includes("unauthorized")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message.includes("Invalid status") || error.message.includes("No fields")) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const deletedTask = await service.remove(req.userId, req.params.id);
    res.json({ 
      message: "Task deleted successfully",
      taskId: deletedTask.id 
    });
  } catch (error) {
    console.error("Error in delete task:", error);
    
    if (error.message.includes("not found") || error.message.includes("unauthorized")) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};