const { RESTDataSource } = require("apollo-datasource-rest");
const DataLoader = require("dataloader");

class MoviesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://movies-api.example.com/";
  }

  willSendRequest(request) {
    request.headers.set("Authorization", this.context.token);
  }

  progressLoader = new DataLoader(async (ids) => {
    const progressList = await this.get("progress", {
      ids: ids.join(","),
    });
    return ids.map((id) => progressList.find((progress) => progress.id === id));
  });

  async getProgressFor(id) {
    return this.progressLoader.load(id);
  }
}

module.exports = {
  moviesAPI: new MoviesAPI(),
};
