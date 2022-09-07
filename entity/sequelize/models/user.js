"use strict";
module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    "user",
    {
      Id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      Name: DataTypes.STRING,
      FullName: DataTypes.INTEGER,

      CreatedBy: DataTypes.UUID,
      UpdatedBy: DataTypes.UUID,
    },
    {
      paranoid: true,
      createdAt: "CreatedDate",
      updatedAt: "LastUpdated",
      deletedAt: "DeletedAt",
    }
  );

  model.associate = function (models) {
    // models.chapter_playlist.belongsTo(models.chapter, {
    //   onDelete: "CASCADE",
    //   foreignKey: "ChapId",
    //   targetKey: "ChapId",
    // });
    // models.chapter_playlist.belongsToMany(models.course_playlist, {
    //   through: models.content_playlist,
    //   onDelete: "CASCADE",
    //   foreignKey: "ChapterPlaylistId",
    //   timestamps: false,
    // });
    // models.chapter_playlist.belongsToMany(models.lesson_playlist, {
    //   through: models.content_playlist,
    //   onDelete: "CASCADE",
    //   foreignKey: "ChapterPlaylistId",
    //   timestamps: false,
    // });
  };

  return model;
};
