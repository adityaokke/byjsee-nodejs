const getUserId = function (user) {
  a
  return (user && user.id) || null;
};
module.exports = {
  GetGlobalHooks() {
    return {
      beforeCreate(instance, options) {
        if (instance.Tags === "error handleTags") {
          instance.Tags = "[]";
        }
        if (instance.rawAttributes.hasOwnProperty("CreatedBy")) {
          instance.CreatedBy = instance.CreatedBy || getUserId(options.user);
        }
        if (instance.rawAttributes.hasOwnProperty("UpdatedBy")) {
          instance.UpdatedBy = getUserId(options.user);
        }
      },
      beforeUpdate(instance, options) {
        if (instance.Tags === "error handleTags") {
          instance.Tags = undefined;
        }
        if (instance.rawAttributes.hasOwnProperty("UpdatedBy")) {
          instance.UpdatedBy = getUserId(options.user);
        }
      },
      beforeDestroy(instance, options) {
        if (options.model.rawAttributes.hasOwnProperty("UpdatedBy")) {
          instance.UpdatedBy = getUserId(options.user);
        }
      },
      beforeBulkCreate(instances, options) {
        instances.forEach((instance) => {
          if (instance.rawAttributes.hasOwnProperty("CreatedBy")) {
            instance.CreatedBy = instance.CreatedBy || getUserId(options.user);
          }
          if (instance.rawAttributes.hasOwnProperty("UpdatedBy")) {
            instance.UpdatedBy = getUserId(options.user);
          }
        });
      },
      beforeBulkUpdate(options) {
        if (options.model.rawAttributes.hasOwnProperty("UpdatedBy")) {
          options.fields.push("UpdatedBy");
          options.attributes.UpdatedBy = getUserId(options.user);
        }
      },
      async beforeBulkDestroy(options) {
        const { model } = options;
        if (options.__custom === undefined) {
          options.__custom = {};
        }
        if (options.__custom.instances === undefined) {
          options.__custom.instances = await model.findAll({
            where: options.where,
            include: options.include,
            transaction: options.transaction,
            paranoid: options.paranoid,
          });
        }
      },
      async afterBulkDestroy(options) {
        const where = {};
        if (options.__custom.instances) {
          const { model } = options;
          Object.keys(model.rawAttributes).forEach((key) => {
            if (model.rawAttributes[key].primaryKey) {
              where[key] = [];
            }
          });
          const primaryKeys = Object.keys(where);
          options.__custom.instances.forEach((instance) => {
            primaryKeys.forEach((key) => {
              where[key].push(instance[key]);
            });
          });
          if (options.model.rawAttributes.hasOwnProperty("UpdatedBy")) {
            await model.update(
              { UpdatedBy: getUserId(options.user) },
              {
                where,
                hooks: false,
                transaction: options.transaction,
                paranoid: false,
              }
            );
          }
          // destroy all associated model that have paranoid enabled
          if (model.options.paranoid) {
            const promises = [];
            const mainPrimaryKey = model.primaryKeyField;
            const mainPrimaryKeyValues = where[mainPrimaryKey];
            Object.keys(model.associations).forEach((key) => {
              const assoc = model.associations[key];
              if (assoc.options.includeSoftDelete) {
                const opt = {
                  where: {
                    [assoc.foreignKey]: mainPrimaryKeyValues,
                  },
                  user: options.user,
                  transaction: options.transaction,
                };
                if (
                  assoc.associationType == "BelongsToMany" &&
                  assoc.throughModel.options.paranoid
                ) {
                  opt.where = {
                    ...opt.where,
                    ...assoc.options.through.scope,
                  };
                  promises.push(assoc.throughModel.destroy(opt));
                } else if (assoc.target.options.paranoid) {
                  promises.push(assoc.target.destroy(opt));
                }
              }
            });
            await Promise.all(promises).catch((err) => {
              console.log(
                `afterBulkDestroy-${model.name}-${options.user.id}-${mainPrimaryKeyValues}: ` +
                  err
              );
              // throw to trigger transaction failed on destroy sequelize function
              throw err;
            });
          }
        }
      },
    };
  },
};
