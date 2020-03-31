<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
  <el-card>
    <el-table :data="rightsList" border stripe>
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="authName" label="权限说明"></el-table-column>
        <el-table-column prop="path" label="访问路径"></el-table-column>
        <el-table-column prop="level" label="权限层级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag type="success" v-if="scope.row.level==='1'">二级</el-tag>
            <el-tag type="warning" v-if="scope.row.level==='2'">三级</el-tag>
          </template>
        </el-table-column>
    </el-table>
  </el-card>
      <!-- <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum" :page-sizes="[2,5,10]" :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination> -->

  </div>
</template>
<script>
export default {
  data() {
    return {
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('/rights/list')

      if (res.meta.status !== 200) {
        this.$message.error('获取权限列表失败')
        return
      }
      this.rightsList = res.data
    }
  }
}
</script>
<style lang="less" scoped>
</style>
